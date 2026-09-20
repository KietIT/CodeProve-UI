# CodeProve - Frontend Refactor Plan

- Phạm vi: Frontend only (Next.js/React). Backend và Ciel API (Claude qua OpenRouter) giữ nguyên phần đang chạy ổn, chỉ di chuyển cách gọi vào service layer mới.
- Timeline: trong tuần này (7 ngày làm việc, có buffer).
- Tham khảo thiết kế: joinai.com (đã phân tích, áp dụng có chọn lọc - xem Phase 1 và 3).

---

## 0. Nguyên tắc chỉ đạo

1. **3 lớp tách biệt**: Presentation (component) - Orchestration (state/hooks) - Data (service layer). Sửa 1 lớp không được kéo domino sang lớp khác.
2. **Không big-bang rewrite**: mỗi phase là 1 branch riêng, merge xong mới sang phase kế. Nhánh `main` luôn phải chạy được.
3. **Giữ cái đang chạy tốt**: Ciel API integration đang hoạt động ổn định - không viết lại logic gọi API, chỉ di chuyển vị trí code (refactor, không rewrite).
4. **Tách rủi ro**: không refactor UI và refactor data-layer trong cùng 1 commit/PR. Nếu lỗi, phải biết ngay lỗi ở tầng nào.
5. **Định nghĩa hoàn thành (DoD chung cho mọi phase)**:
   - Build không lỗi (`npm run build`), không lỗi TypeScript (`tsc --noEmit`)
   - `npm run lint` sạch
   - Luồng chính (golden path: Landing -> Dashboard -> Workspace -> Submit -> Report) chạy được end-to-end sau mỗi phase
   - Không còn console error/warning khi thao tác qua các màn hình vừa refactor

---

## 1. Kiến trúc & Tech stack

```
Presentation   -> components/  (UI thuần, không gọi API trực tiếp)
Orchestration  -> stores/ (Zustand) + hooks gọi TanStack Query
Data           -> lib/api/ (service layer, typed, là boundary duy nhất với backend)
```

| Nhu cầu | Công cụ | Lý do |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Đã dùng sẵn, giữ nguyên |
| Styling | Tailwind CSS + design tokens riêng | Nhanh, dễ maintain design system |
| Server state (Ciel response, session, problems, report) | TanStack Query | Cache, retry, loading/error state có sẵn, tránh viết lại `useEffect` thủ công |
| Client/UI state (editor content, panel mở/đóng, tab active) | Zustand | Nhẹ, không cần Provider lồng nhau |
| Form (login, signup, prompt input) | React Hook Form + Zod | Validate schema-first, khớp trực tiếp với API contract |
| Code editor | Monaco Editor (`@monaco-editor/react`) | Chuẩn cho code editor trong trình duyệt |
| Chart | Recharts hoặc tự vẽ SVG cho radar 6 trục | Recharts có sẵn RadarChart component |
| 3D hero | Three.js (giữ nguyên), load qua `next/dynamic` với `ssr: false` | Tránh chặn TTI |
| API mocking khi test | MSW (Mock Service Worker) | Test được UI mà không cần backend thật chạy |

---

## 2. Cấu trúc thư mục đầy đủ

```
src/
  app/
    (marketing)/
      page.tsx              -> Landing
      pricing/page.tsx
      layout.tsx             -> dùng MarketingNav
    (app)/
      dashboard/page.tsx
      workspace/[sessionId]/page.tsx
      report/[sessionId]/page.tsx
      layout.tsx              -> dùng AppSidebar, check auth (route guard)
    login/page.tsx
    signup/page.tsx
  components/
    shell/
      MarketingNav.tsx
      AppSidebar.tsx
    ui/
      Button.tsx, Card.tsx, Badge.tsx
      SectionBadge.tsx        -> pill badge trên heading (học từ joinai.com)
      StatBlock.tsx             -> số to + label
      LevelBadge.tsx             -> Easy/Medium/Hard theo màu
      AvatarStack.tsx             -> chồng avatar + count
    landing/
      Hero.tsx, HowItWorks.tsx, Pricing.tsx, FAQ.tsx
      ProductPreviewSection.tsx    -> nhúng screenshot/demo Workspace thật
    dashboard/
      ProblemTable.tsx               -> search + filter pill + dropdown + table
    workspace/
      CodeEditor.tsx
      CielPanel.tsx
      PromptLog.tsx
      HintAccordion.tsx
      ResultTabs.tsx                  -> Terminal / Tests / Leaderboard
    report/
      RadarChart.tsx
      IntegrityFlags.tsx
  lib/
    api/
      client.ts                        -> fetch wrapper chung (base URL, headers, error handling)
      auth.ts
      problems.ts
      sessions.ts
      ciel.ts                            -> di chuyển logic Ciel hiện có vào đây
      report.ts
    stores/
      useSessionStore.ts
      useEditorStore.ts
    types/
      session.ts, problem.ts, fluency-score.ts, prompt-log-entry.ts, integrity-flag.ts
    theme/
      tokens.ts                          -> export màu/spacing dùng chung với tailwind.config
  mocks/
    handlers.ts                          -> MSW handlers cho dev/test
```

---

## Phase 0 - Audit & Chuẩn bị

**Sửa phần nào**: không sửa code, chỉ khảo sát.

**Cách làm**:
1. Liệt kê toàn bộ route, component, page hiện có vào 1 file `AUDIT.md` tạm.
2. Ghi lại toàn bộ API call hiện tại đang gọi từ frontend (endpoint, method, payload, response) - đặc biệt là Ciel, vì đây là phần phải giữ nguyên hành vi.
3. `git tag pre-refactor` để có điểm rollback rõ ràng.
4. Bật `strict: true` trong `tsconfig.json` nếu chưa có, chạy `tsc --noEmit` để thấy toàn bộ lỗi type hiện tại (không cần fix ngay, chỉ để biết quy mô).

**Tech stack**: không thêm gì mới.

**Lưu ý/Tránh**:
- Đừng xoá code cũ trước khi có bản mới thay thế chạy được.
- Đừng bỏ qua bước ghi lại API contract của Ciel - đây là phần dễ bị phá vỡ nhất nếu di chuyển code sai cách.

**Tiêu chí hoàn thành**:
- [x] Có `AUDIT.md` liệt kê đủ route/component/API call hiện tại
- [x] Có git tag `pre-refactor`
- [x] Biết số lượng lỗi TypeScript hiện tại (baseline)

**Kiểm thử GET/POST**: chưa cần test mới, chỉ xác nhận lại (qua Network tab của DevTools) các request Ciel hiện tại: method, endpoint, request body, response shape - ghi vào Phụ lục A bên dưới làm baseline.

---

## Phase 1 - Design System & UI Primitives (Ngày 1)

**Sửa phần nào**: `lib/theme/tokens.ts`, `tailwind.config.ts`, toàn bộ `components/ui/`.

**Cách làm**:
1. Định nghĩa token màu/spacing/font trong `tokens.ts`, import vào `tailwind.config.ts` qua `theme.extend`. Giữ nguyên `#070b0f` (nền) và `#3ed4c5` (teal accent), font Inter.
2. Thêm 2 màu status mới (học từ joinai.com: họ dùng màu riêng cho Easy/Medium): 1 màu cam cho Medium/Yellow-flag, 1 màu đỏ cho Red-flag (Integrity Score).
3. Build từng component nguyên tử trong `components/ui/`: `Button`, `Card`, `Badge`, `SectionBadge`, `StatBlock`, `LevelBadge`, `AvatarStack`. Mỗi component chỉ nhận props, không tự gọi API hay đọc store.
4. Viết 1 trang test nội bộ `/dev/ui-preview` (xoá trước khi deploy) để nhìn tất cả component cùng lúc thay vì phải chạy qua từng page thật.

**Tech stack**: Tailwind CSS, không cần thêm thư viện UI ngoài (tự build để khớp brand).

**Lưu ý/Tránh**:
- Không hardcode màu trực tiếp trong component (`bg-[#3ed4c5]`) - luôn dùng token (`bg-accent`) để sau này đổi màu chỉ sửa 1 chỗ.
- Không để `SectionBadge`/`StatBlock` chứa logic nghiệp vụ (vd tính điểm) - chúng chỉ hiển thị dữ liệu được truyền vào.

**Tiêu chí hoàn thành**:
- [x] Toàn bộ 7 component trong `components/ui/` build xong, có props typed rõ ràng
- [x] Trang `/dev/ui-preview` render đủ tất cả component, không lỗi console
- [x] Không còn màu hardcode ngoài `tokens.ts`

**Kết quả triển khai Phase 1 (20/09/2026):** checklist riêng của phase đạt; build, TypeScript, lint và 5 test UI đều pass. Dark/light và responsive preview đã kiểm tra. Ciel HTTP trên tunnel/local đều 200 đúng contract. Golden path local đã hoàn tất qua hai lượt Ciel, Run 2/2 PASS, Submit, Explain-back và Report attempt 22; console không ghi nhận error/warning trong lần kiểm tra. Người dùng mở fullscreen trực tiếp, không sửa guard. Đã đủ bằng chứng DoD; chưa commit/merge/push Phase 1, chưa bắt đầu Phase 2. Chi tiết, quyết định và giới hạn: [CodeProve-Phase-1-Verification.md](CodeProve-Phase-1-Verification.md).

**Kiểm thử GET/POST**: không áp dụng (phase này không đụng API).

---

## Phase 2 - Service Layer & State Management (Ngày 2)

**Sửa phần nào**: toàn bộ `lib/api/`, `lib/stores/`, provider TanStack Query ở `app/layout.tsx`.

**Cách làm**:
1. Viết `lib/api/client.ts`: 1 hàm `apiFetch<T>(path, options)` xử lý base URL, headers, parse JSON, throw lỗi typed khi status không ok.
2. Viết từng service file (`auth.ts`, `problems.ts`, `sessions.ts`, `ciel.ts`, `report.ts`) - mỗi hàm export ra tương ứng 1 endpoint, có input/output type rõ ràng (dùng type trong `lib/types/`).
3. **Di chuyển nguyên logic gọi Ciel hiện có** vào `lib/api/ciel.ts`, giữ nguyên request/response shape đang chạy - không đổi logic, chỉ đổi vị trí.
4. Bọc `ciel.ts` qua `useMutation` (TanStack Query) trong 1 hook riêng `hooks/useCiel.ts` để component gọi qua hook, không gọi thẳng service layer.
5. Setup `QueryClientProvider` ở root layout.
6. Tạo `stores/useSessionStore.ts` (session hiện tại, danh sách prompt log tạm) và `useEditorStore.ts` (nội dung code, ngôn ngữ, panel đang mở) bằng Zustand.

**Tech stack**: `@tanstack/react-query`, `zustand`.

**Lưu ý/Tránh**:
- Đây là phase rủi ro cao nhất với Ciel - làm xong phải test lại y hệt luồng hỏi Ciel cũ trước khi merge.
- Không nhét state UI thuần (vd panel đang mở) vào TanStack Query - nó dùng cho server state, không phải UI state.
- Không gọi `fetch` trực tiếp trong component nào nữa kể từ phase này trở đi - mọi thứ đi qua `lib/api/`.

**Tiêu chí hoàn thành**:
- [ ] Mọi hàm trong `lib/api/` có type cho input và output
- [ ] Ciel vẫn trả lời đúng như trước khi refactor (test tay 3-5 câu hỏi)
- [ ] Không còn `fetch(...)` rải rác trong component

**Kiểm thử GET/POST**:
- `POST /api/ciel/ask`: gọi với 3 case - câu hỏi bình thường, câu hỏi rỗng (phải bị chặn ở validate trước khi gửi), session không tồn tại (phải nhận lỗi và hiển thị UI error, không crash app)
- Kiểm tra qua DevTools Network: request body và response phải giống hệt bản ghi lại ở Phụ lục A (Phase 0) - nếu khác là đã vô tình đổi hành vi

---

## Phase 3 - Marketing Shell: Landing & Pricing (Ngày 3)

**Sửa phần nào**: `app/(marketing)/`, `components/shell/MarketingNav.tsx`, `components/landing/`.

**Cách làm**:
1. Tách `MarketingNav` thành component riêng, dùng `SectionBadge`/`StatBlock` mới build ở Phase 1 cho các section.
2. Viết lại headline hero: 1 câu 2 màu, tô teal cho phần nhấn mạnh (học từ joinai.com).
3. Thêm mới `ProductPreviewSection.tsx` ngay dưới hero - nhúng ảnh chụp/preview thật của Workspace (editor + Ciel panel), không chỉ dùng minh hoạ trừu tượng. Đây là điểm học quan trọng nhất từ joinai.com: cho thấy sản phẩm thật càng sớm càng tăng độ tin cậy.
4. Refactor Pricing: thêm toggle Monthly/Annual, ribbon "Phổ biến nhất" rõ ràng hơn trên tier đề xuất, giá gạch ngang giá cũ nếu có annual discount.
5. Lazy-load Three.js hero qua `next/dynamic(() => import('...'), { ssr: false })`.

**Tech stack**: không thêm thư viện mới, tận dụng `components/ui/` đã có.

**Lưu ý/Tránh**:
- Không copy nguyên layout joinai.com - chỉ mượn nguyên tắc (badge, stat block, product preview sớm), giữ màu và giọng văn riêng của CodeProve.
- Toggle Monthly/Annual là UI state thuần - không cần TanStack Query, dùng `useState` tại chỗ là đủ.

**Tiêu chí hoàn thành**:
- [ ] Lighthouse Performance score trang Landing >= 80 (sau khi lazy-load Three.js)
- [ ] `ProductPreviewSection` render đúng trên mobile (không tràn ngang)
- [ ] Toggle Monthly/Annual đổi giá đúng, không reload trang

**Kiểm thử GET/POST**: trang Landing/Pricing không gọi API động (nội dung tĩnh) - nếu form đăng ký newsletter có, test `POST /api/newsletter` với email hợp lệ và không hợp lệ (phải hiện lỗi validate phía client trước khi gửi).

---

## Phase 4 - App Shell & Dashboard (Ngày 4)

**Sửa phần nào**: `app/(app)/layout.tsx`, `components/shell/AppSidebar.tsx`, `app/(app)/dashboard/page.tsx`, `components/dashboard/ProblemTable.tsx`.

**Cách làm**:
1. Viết `AppSidebar`: icon sidebar dọc (Dashboard, Problems, Progress, Leaderboard) - tách hẳn khỏi `MarketingNav`.
2. Trong layout `(app)`, thêm route guard: nếu chưa auth, redirect về `/login`. Dùng session/cookie hiện có, không đổi cơ chế auth.
3. Build `ProblemTable`: ô search, filter pill (All/dạng bài), 2 dropdown (Topic, Level), bảng có avatar stack người làm, `LevelBadge`.
4. Dữ liệu bảng lấy qua `useQuery` gọi `lib/api/problems.ts` (`GET /api/problems`) - có loading skeleton và error state rõ ràng, không để trắng trang khi lỗi.

**Tech stack**: TanStack Query (`useQuery`), component đã có từ Phase 1.

**Lưu ý/Tránh**:
- Route guard phải chạy ở server component/middleware nếu có thể, không chỉ check ở client - tránh lộ nội dung trang trước khi redirect.
- Search/filter nên debounce (300ms) trước khi lọc, tránh re-render liên tục khi gõ nhanh.

**Tiêu chí hoàn thành**:
- [ ] Chưa login thì không vào được `/dashboard` (redirect đúng)
- [ ] `ProblemTable` load được danh sách thật từ API, có skeleton khi loading
- [ ] Search và 2 filter hoạt động đồng thời (kết hợp AND, không phải OR)

**Kiểm thử GET/POST**:
- `GET /api/problems`: test không query param (trả full list), có `?topic=` và `?level=` (trả đúng tập con), query không khớp gì (trả mảng rỗng, UI hiện "Không tìm thấy bài phù hợp" chứ không phải màn hình trắng)
- Test luôn case lỗi mạng: tắt network giả lập, kiểm tra UI hiện thông báo lỗi + nút "Thử lại" thay vì crash

---

## Phase 5 - Workspace: Editor + Ciel + Verification (Ngày 5-6)

Đây là phần phức tạp nhất, chiếm 2 ngày.

**Sửa phần nào**: `app/(app)/workspace/[sessionId]/page.tsx` và toàn bộ `components/workspace/`.

**Cách làm**:
1. Layout 2 cột giống joinai.com: trái là đề bài (Task, Input/Output, Examples, Requirements, `HintAccordion` collapsible), phải là `CodeEditor` (Monaco) + nút Ask AI/Run/Submit ngang hàng phía trên, `ResultTabs` (Terminal/Tests/Leaderboard) phía dưới.
2. `CodeEditor`: dùng `@monaco-editor/react`, nội dung code lưu vào `useEditorStore` (Zustand), không lưu vào TanStack Query.
3. `CielPanel`: gọi qua hook `useCiel()` đã build ở Phase 2 - **không đổi logic gọi API, chỉ đổi UI bọc quanh nó**.
4. `PromptLog`: hiển thị lịch sử hỏi-đáp, lưu tạm ở `useSessionStore`, chưa cần persist DB nếu backend chưa có endpoint riêng cho việc này (dùng payload sẵn có trong response Ciel).
5. Nút Run gọi `POST /api/sessions/:id/run` (test case hiển thị/visible), nút Submit gọi `POST /api/sessions/:id/submit` (test case ẩn, chạy chấm điểm thật) - 2 endpoint khác nhau, không dùng chung 1 hàm.
6. `ResultTabs`: tab Terminal (log run code), tab Tests (danh sách test case + Pass/Fail/Pending), tab Leaderboard (nếu có).

**Tech stack**: `@monaco-editor/react`, TanStack Query (`useMutation` cho Run/Submit/Ciel), Zustand cho editor state.

**Lưu ý/Tránh**:
- **Không refactor UI Workspace và sửa logic Ciel cùng lúc trong 1 PR** - nếu Ciel lỗi sau merge, phải biết ngay là do UI mới hay do logic gọi API.
- Monaco Editor khá nặng - lazy-load nó (`dynamic import`, `ssr: false`) để không chặn render phần đề bài bên trái.
- Đừng để Run/Submit gọi API mà không có debounce/disable nút trong lúc đang chờ response - dễ bị double-submit.
- Test case "Pending" phải có trạng thái riêng biệt với "Fail" trên UI - nhầm 2 cái này khiến sinh viên hiểu sai kết quả.

**Tiêu chí hoàn thành**:
- [ ] Gõ code, bấm Run, thấy kết quả từng test case cập nhật đúng trạng thái (Pass/Fail/Pending)
- [ ] Hỏi Ciel, nhận được câu trả lời giống hệt hành vi trước refactor (đối chiếu với baseline ở Phụ lục A)
- [ ] PromptLog hiển thị đúng thứ tự thời gian các lượt hỏi-đáp
- [ ] Submit xong, được điều hướng đúng sang trang Report với đúng `sessionId`

**Kiểm thử GET/POST**:
- `POST /api/sessions/:id/run`: test với code đúng (tất cả case Pass), code sai (1 số case Fail, có message lỗi rõ), code lỗi cú pháp (không crash app, hiện lỗi syntax trong tab Terminal)
- `POST /api/sessions/:id/submit`: test submit khi chưa Run lần nào (phải cho phép, không bắt buộc Run trước), submit 2 lần liên tiếp (nút phải bị disable trong lúc đang xử lý lần đầu)
- `POST /api/ciel/ask`: test hỏi liên tiếp nhiều câu (context/history phải được giữ đúng qua các lượt), test khi mất mạng giữa chừng (UI hiện lỗi, không mất nội dung đã gõ trong ô hỏi)

---

## Phase 6 - Report Page (cuối Ngày 6)

**Sửa phần nào**: `app/(app)/report/[sessionId]/page.tsx`, `components/report/RadarChart.tsx`, `components/report/IntegrityFlags.tsx`.

**Cách làm**:
1. `RadarChart`: vẽ 6 trục của Fluency Framework bằng Recharts `RadarChart`, dữ liệu lấy qua `useQuery` gọi `GET /api/sessions/:id/report`.
2. `IntegrityFlags`: hiển thị cờ cảnh báo (nếu phát hiện dấu hiệu gian lận) - dùng `LevelBadge` màu đỏ/cam đã build ở Phase 1, không tạo màu mới.
3. Thêm widget phụ bên cạnh radar chart (học từ joinai.com: họ có "Community pulse" cạnh nội dung chính) - vd "Session pulse": số lần Run, số câu hỏi Ciel, thời gian làm bài.

**Tech stack**: Recharts (hoặc SVG tự vẽ nếu muốn kiểm soát chi tiết hơn).

**Lưu ý/Tránh**:
- Report phải render được ngay cả khi thiếu 1-2 trục dữ liệu (không throw lỗi nếu backend trả về object thiếu field) - dùng optional chaining và giá trị mặc định.
- Không tính toán điểm số ở frontend - chỉ hiển thị dữ liệu backend trả về.

**Tiêu chí hoàn thành**:
- [ ] Radar chart render đúng 6 trục với dữ liệu thật từ API
- [ ] Integrity flag (nếu có) hiển thị rõ ràng, không bị ẩn dưới fold
- [ ] Trang không crash khi báo cáo thiếu field (test với response giả lập thiếu dữ liệu)

**Kiểm thử GET/POST**:
- `GET /api/sessions/:id/report`: test với session đã hoàn thành (trả đủ 6 trục điểm), session chưa submit (phải trả lỗi 404/400 rõ ràng, UI hiện "Báo cáo chưa sẵn sàng" thay vì màn hình trắng), session có integrity flag (UI hiện đúng badge cảnh báo)

---

## Phase 7 - QA, Performance & Buffer (Ngày 7)

**Sửa phần nào**: toàn bộ, không thêm tính năng mới - chỉ dọn dẹp và kiểm tra.

**Cách làm**:
1. Chạy lại toàn bộ golden path (Landing -> Login -> Dashboard -> Workspace -> Submit -> Report) 3 lần liên tiếp, ghi lại mọi lỗi console.
2. Kiểm tra responsive ở 3 breakpoint: mobile (375px), tablet (768px), desktop (1440px).
3. Chạy Lighthouse cho Landing và Workspace, xử lý các cảnh báo performance/accessibility điểm thấp.
4. Xoá trang `/dev/ui-preview` và mọi code debug tạm.
5. Viết `types/` đầy đủ cho các entity chính nếu Phase trước còn thiếu, và note lại API contract cuối cùng cho backend phase sau (xem Phụ lục A).

**Tech stack**: Lighthouse, TypeScript compiler để rà lỗi type còn sót.

**Lưu ý/Tránh**:
- Đừng thêm tính năng mới ở phase này - chỉ ổn định lại những gì đã có.
- Kiểm tra kỹ trên trình duyệt/máy chiếu thật nếu sắp demo, không chỉ test trên máy dev.

**Tiêu chí hoàn thành**:
- [ ] Golden path chạy đúng 3/3 lần thử, không lỗi console
- [ ] Responsive đạt ở cả 3 breakpoint
- [ ] `tsc --noEmit` không còn lỗi
- [ ] Không còn code/route debug tạm trong build production

**Kiểm thử GET/POST**: chạy lại toàn bộ test matrix ở Phụ lục B một lượt cuối trước khi merge `main`.

---

## Phụ lục A - API Contract baseline Phase 0

**Cập nhật 20/09/2026, commit baseline `7c717e3`.** Bảng dưới phản ánh call site và type trong `lib/api.ts`, `lib/auth.tsx` và `AuthPanel.tsx`, thay cho endpoint giả định của bản nháp. Ảnh Network ban đầu chỉ cho thấy mentor attempt 91 trả HTTP 500 và không đọc được response body. Nay đã bổ sung HTTP POST thật trên tunnel mới (attempt 94) và backend local (attempt 21): cả hai trả 200 và body khớp `{ reply: string, injected_error: boolean }`. Bằng chứng mới là HTTP trực tiếp, không gọi nhầm là ảnh DevTools. Xem [Ciel live verification](CodeProve-Ciel-Live-Verification.md). Inventory, response types đầy đủ và các khác biệt với plan nằm trong [AUDIT.md](../../../AUDIT.md).

Base URL từ `NEXT_PUBLIC_API_URL` (local/fallback: `http://localhost:8000`), wrapper nối `/api`; JSON request/response; bearer token từ localStorage `codeprove_token` nếu có. Login/signup không gắn bearer. Hiện chưa có cookie session/server route guard.

| Method | Endpoint | Request body / query | Response frontend kỳ vọng | Dùng ở |
|---|---|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` | `{ access_token, user }` | AuthProvider.login → AuthPanel |
| POST | `/api/auth/signup` | `{ full_name, email, password }` | `{ access_token, user }` | AuthProvider.signup → AuthPanel |
| GET | `/api/auth/me` | Không body | `{ id, full_name, email, avatar? }` trực tiếp | AuthProvider mount / OAuth token; helper getMe chưa có caller |
| PATCH | `/api/auth/me` | `{ full_name?, avatar? }` | `Me` cùng shape user ở trên | Profile: tên/avatar |
| GET (navigation) | `/api/auth/google/start` | Không body; full-page navigation | OAuth redirect, không có JSON type ở frontend | Google sign-in |
| GET | `/api/exercises` | query `level` tùy chọn | `LevelGroup[]`: `{ level, name, exercises: ExerciseSummary[] }[]` | LevelExercises |
| GET | `/api/exercises/:code` | Không body | `ExerciseDetail` | Workspace briefing |
| POST | `/api/attempts` | `{ exercise_code }` | `{ attempt_id: number, started_at: string }` | Workspace mount |
| GET | `/api/attempts/:id` | Không body | `{ id, exercise_code, status, score, latest_code }` | Helper getAttempt, chưa có caller hiện tại |
| POST | `/api/attempts/:id/events` | `{ events: [{ type, ts, payload?, integrity_flags? }] }` | `{ ingested: number }` | Telemetry queue |
| POST | `/api/attempts/:id/snapshots` | `{ version, source_code }` | `{ ok: boolean }` | Autosave, trước Run/Submit |
| POST | `/api/attempts/:id/run` | `{ source_code, run_tests: true }` | `{ passed, total, coverage, cases: [{ name, passed, stdout, error }], runtime_error }` | Run |
| POST | `/api/attempts/:id/mentor` | `{ message, code? }`; UI luôn truyền code hiện tại | `{ reply: string, injected_error: boolean }` | Ciel |
| POST | `/api/attempts/:id/hypothesis` | `{ text }` | `{ correct: boolean, note: string }` | Giả thuyết |
| POST | `/api/attempts/:id/submit` | query `locale=vi\|en`; **không body** | `{ questions: string[] }` | Submit → ExplainBackModal |
| POST | `/api/attempts/:id/explain-back` | `{ answers: [{ question, answer }] }` | `ReportOut` | Explain-back → `/feedback?attempt=<id>` |
| GET | `/api/attempts/:id/report` | Không body | `ReportOut`: `{ overall, tier, axes, axes_pct, feedback, integrity_status, timeline }` | FeedbackContent |
| GET | `/api/dashboard` | Không body | `{ kpis, radar, trend, recent }` | Dashboard |

**Baseline Ciel từ source:** trim prompt, chặn rỗng/đang gửi, cần attempt ID; gửi current editor code cùng message; không gửi `history` hay `sessionId` trong body. Reply được append theo thứ tự vào state hội thoại; `injected_error` điều khiển nhắc kiểm chứng. Khi lỗi, UI hiện `[Error] <message>` và input đã bị xóa; chưa có retry riêng. Chưa xác minh cách backend lưu context. Không tự thêm `promptLogEntry` vào response khi di chuyển service.

**Đối chiếu bắt buộc trước Phase 2:** các tên `/api/problems`, `/api/sessions`, `/api/ciel/ask` trong mô tả phase/Phụ lục B vẫn là tên nháp, không phải căn cứ đổi endpoint. Ánh xạ sang `/api/exercises`, `/api/attempts`, `/api/attempts/:id/mentor` theo bảng này và dùng bằng chứng live ngày 20/09 làm baseline. Giữ bước Explain-back, không giả định Submit trả `status` hoặc nhận `{ code }`. Không có evidence hiện tại cho query `topic/search`, report `stats`/`integrityFlags`, hay API leaderboard/newsletter; không bịa dữ liệu hoặc endpoint để khớp UI.

**Ciel contract live verification: PASS, 20/09/2026.** `POST /api/attempts/94/mentor` trên `https://simultaneously-interim-poster-reasoning.trycloudflare.com` trả 200 trong 3.352 ms; `POST /api/attempts/21/mentor` trên `http://localhost:8000` trả 200 trong 4.150 ms. Request gồm `message`, `code`; response đúng hai keys `reply`, `injected_error`, lần này có giá trị `true`. Không có `history`, `sessionId`, `promptLogEntry` trong body được quan sát. File evidence chứa JSON thật đã loại credential. Kết quả không thay thế test context/lỗi của Phase 2/5 và không kết luận nguyên nhân HTTP 500 cũ. Không lưu bearer token/mật khẩu vào tài liệu.

---

## Phụ lục B - Test Matrix GET/POST tổng hợp

| Endpoint | Case thành công | Case lỗi/biên | Kỳ vọng UI khi lỗi |
|---|---|---|---|
| `GET /api/problems` | Trả full list | Query không khớp gì | "Không tìm thấy bài phù hợp", không phải trắng trang |
| `POST /api/sessions` | Trả `sessionId` hợp lệ | `problemId` không tồn tại | Toast lỗi, không điều hướng sang Workspace |
| `POST /api/sessions/:id/run` | Code đúng, đủ Pass | Code lỗi cú pháp | Hiện lỗi trong tab Terminal, không crash editor |
| `POST /api/sessions/:id/submit` | Trả `status: submitted` | Submit khi session đã submit rồi | Chặn ở UI (nút disable) hoặc hiện lỗi rõ ràng |
| `POST /api/ciel/ask` | Trả `reply` đúng ngữ cảnh | Mất mạng giữa chừng | Giữ nguyên nội dung đã gõ, hiện nút "Thử lại" |
| `GET /api/sessions/:id/report` | Trả đủ 6 trục điểm | Session chưa submit | "Báo cáo chưa sẵn sàng", không trắng trang |

---

## Phụ lục C - Git Workflow

- Branch chính: `main` - luôn phải build được và chạy được golden path.
- Mỗi phase 1 branch: `refactor/phase-1-design-system`, `refactor/phase-2-service-layer`, ...
- Merge vào `main` chỉ khi đạt đủ DoD của phase đó (checklist ở mỗi phần trên).
- Nếu phase nào phát sinh lỗi nghiêm trọng sau merge, rollback về tag `pre-refactor` hoặc commit trước đó - không cố fix vá trên `main` khi đang gần deadline demo.

---

## Tổng kết lịch theo ngày

| Ngày | Phase | Trọng tâm |
|---|---|---|
| 0 (trước khi bắt đầu) | Phase 0 | Audit, ghi API contract baseline |
| 1 | Phase 1 | Design system + UI primitives |
| 2 | Phase 2 | Service layer + state management, di chuyển Ciel |
| 3 | Phase 3 | Landing + Pricing |
| 4 | Phase 4 | App shell (sidebar) + Dashboard |
| 5-6 | Phase 5 | Workspace (Editor + Ciel + Verification) |
| 6 (cuối ngày) | Phase 6 | Report page |
| 7 | Phase 7 | QA, performance, buffer |
