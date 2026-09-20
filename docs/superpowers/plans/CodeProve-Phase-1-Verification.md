# Phase 1 — Design System & UI Primitives

Phạm vi theo `CodeProve-Frontend-Refactor-Plan.md`; branch `refactor/phase-1-design-system`, baseline `7c717e3`. Ghi nhận ngày 20/09/2026. Chưa merge/push và chưa triển khai Phase 2.

## Kết quả triển khai

- `lib/theme/tokens.ts` là nơi định nghĩa màu, spacing, typography, radius và shadow; Tailwind import tokens và phát sinh CSS variables cho dark/light.
- Dark: background `#070b0f`, accent `#3ed4c5`, Inter; status warning cam và danger đỏ. Light dùng các biến thể đủ tương phản.
- Bảy component typed, chỉ nhận props, không gọi API/store: `Button`, `Card`, `Badge`, `SectionBadge`, `StatBlock`, `LevelBadge`, `AvatarStack`.
- Màu literal trong UI/CSS/Three.js được chuyển về tokens; giữ palette minh họa và thương hiệu ngoài. Các token alias cũ vẫn hoạt động.
- `/dev/ui-preview` hiển thị các component, variant, trạng thái disabled, flag và avatar rỗng/tổng lớn hơn danh sách. Chỉ render ở development; vẫn phải xóa route trước deploy/Phase 7 theo plan.
- Thêm ESLint tương thích Next 14, cấu hình `next/core-web-vitals` và `npm test` dùng Node + TypeScript hiện có; không thêm thư viện UI.

## API props chính

| Component | Props riêng |
|---|---|
| Button | `variant`, `size`, `disabled`, `href` hoặc native button props; disabled link không điều hướng/tab |
| Card | `variant`: default/outlined/accent; native div props |
| Badge | `tone`: neutral/accent/success/warning/danger |
| SectionBadge | Badge props và `icon` |
| StatBlock | `value`, `label`, `description`; không tính điểm |
| LevelBadge | `level`: Easy/Medium/Hard/green/yellow/red; `label` để caller dịch |
| AvatarStack | `avatars`, `maxVisible`, `total`, `label`; initials khi không có URL ảnh |

## Bằng chứng kiểm tra

| Kiểm tra | Kết quả |
|---|---|
| `npm test` | 5/5: disabled link, native button props, avatar tổng/empty, label của level/flag |
| `tsc --noEmit --incremental false` | Exit 0, không lỗi |
| `npm run lint` | Không error/warning |
| `npm run build` | Exit 0; compiled, type/lint checks, 22/22 static build tasks; landing 157 kB và solve 144 kB First Load JS, bằng baseline |
| Browser preview | Render đủ 7 primitives; dark desktop 1440px, dark tablet 768px, light mobile 375px; không tràn ngang |
| Browser behavior | Primary click tăng counter; theme toggle hoạt động; disabled link không có href và tabindex -1 |
| Browser computed styles | Dark background `rgb(7, 11, 15)`, accent `rgb(62, 212, 197)`; Inter được load |
| Console preview lần cuối | Không error/warning; chỉ React DevTools info |
| Production preview | `next start` và HTTP GET `/dev/ui-preview` → 404 |
| Color scan | Không còn literal hex/rgb/hsl trong app/components/lib ngoài tokens; `session #4f2a` là nội dung demo, không phải màu |
| API contract | Không đổi `lib/api.ts`, auth hoặc shape request/response Ciel |
| Ciel live, 20/09 | HTTP POST thật: tunnel attempt 94 và local attempt 21 đều 200, body khớp `{ reply: string, injected_error: boolean }`; xem [evidence](CodeProve-Ciel-Live-Verification.md) |
| Golden path local, hoàn tất 20/09 | Landing → Login → Dashboard → Workspace/Fresher → CP-001 → fullscreen → giả thuyết → Ciel → Run → Submit → Explain-back → Report attempt 22: PASS |
| Ciel UI / Run | Hai lượt Ciel hiển thị đúng thứ tự, loading/disabled/nhắc kiểm chứng hoạt động; Run 2/2 PASS, coverage 100% |
| Report / console | `/feedback?attempt=22`: 69/100, đủ sáu trục, timeline và integrity badge; console error/warn sau Submit và Report đều `[]` |

## Review và quyết định

- Review độc lập phát hiện keyword trong mockup Workspace light mode quá nhạt khi bỏ override cũ. Đã khôi phục override bằng token; kiểm tra computed color/contrast trên trang thật từ 1,44 (fail) lên 6,74 (pass), ngưỡng 4,5. Không còn finding cần sửa được reviewer nêu.
- Giữ repo hiện tại trên branch riêng; bằng chứng end-to-end đã bổ sung ngày 20/09. Chưa commit/merge/push Phase 1 trong lần nghiệm thu này. Nếu cần cách ly bằng worktree ở phase sau, có thể chuyển sau khi chốt thay đổi.
- Mở rộng thay màu literal sang UI hiện hữu để đáp ứng DoD không hardcode. Hệ quả: màu giao diện cũ cũng thay theo theme; đã kiểm tra preview và mockup, chưa xác nhận mọi màn hình authenticated.
- Giữ light mode và các màu minh họa/Google riêng; chúng đều khai báo trong tokens. Nếu đổi palette sau này, cần kiểm tra lại tương phản từng theme.
- Preview trả notFound ngoài development; vẫn còn source/bundle cho tới bước xóa Phase 7, không coi guard là đã xóa route.
- Lint bổ sung dependency `t.noActiveAttempt` cho callback Run để không giữ bản dịch cũ khi đổi ngôn ngữ. Không đổi endpoint, thứ tự gọi hoặc payload.
- Hai rule font được miễn đúng dòng Material Symbols: icon font cố ý chỉ load trong app shell và `display=block` tránh nháy tên ligature. Không tắt rule toàn dự án.

## Kết luận nghiệm thu

Baseline response Ciel thành công đã xác minh trên cả tunnel và backend local; phần còn thiếu của Phase 0 đã đóng. Người dùng mở fullscreen trực tiếp, sau đó công cụ hoàn tất golden path tới Report trên attempt 22. Giới hạn fullscreen của thao tác tự động đã được giải quyết bằng thao tác thật, không sửa guard.

Phase 1 đã đủ bằng chứng nghiệm thu chức năng theo checklist riêng và DoD chung, kết hợp các kiểm tra build/TypeScript/lint/UI đã ghi ở trên với lần live end-to-end này. Lần bổ sung evidence không thay đổi runtime code. Test context/lỗi mạng/attempt không tồn tại của Phase 2/5 và ba lượt golden path liên tiếp/Lighthouse của Phase 7 vẫn theo phase tương ứng. Chưa bắt đầu Phase 2 hoặc tích hợp Phase 1 vào main.

Mở preview bằng `npm run dev`, truy cập `/dev/ui-preview`. Xóa thư mục `app/dev/ui-preview` trước deploy theo plan.
