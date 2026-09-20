# CodeProve — Phase 0: Frontend Audit

**Ngày khảo sát:** 19/09/2026. **Phạm vi:** đọc codebase, ghi baseline; chưa triển khai Phase 1.

**Tóm tắt —** Frontend hiện dùng Next.js App Router, React và Tailwind tại thư mục gốc, chưa có `src/`. API tập trung trong `lib/api.ts`, nhưng orchestration còn nằm trong component/context. Domain đang dùng `exercises` và `attempts`; Ciel là endpoint mentor của attempt. Submit trả câu hỏi Explain-back, sau đó mới tạo/hiển thị báo cáo. Các endpoint `problems`, `sessions`, `ciel/ask` trong plan ban đầu là nháp, không phải contract đã tìm thấy trong frontend.

**Mức bằng chứng:** “source” là đọc mã nguồn/type/call site; “đã chạy” là kết quả lệnh trong phiên audit. Khi khảo sát local, người dùng xác nhận backend chưa mở. Sau đó người dùng cung cấp ba ảnh Network từ website: đã xác nhận method, URL, payload và status 500 của Ciel trên backend qua Cloudflare Tunnel. Chưa quan sát được response body hoặc response thành công; không dùng mock để coi như đã xác minh live.

## I. Baseline và phạm vi đọc

| Hạng mục | Kết quả |
|---|---|
| Commit ban đầu | `7c717e307debd97f218654578c75f54572bc7c46` trên `main` |
| Điểm rollback | Tag local `pre-refactor` trỏ đúng commit trên |
| Nhánh audit | `refactor/phase-0-audit`; chưa commit, push hoặc merge |
| Working tree lúc bắt đầu | Chỉ plan `docs/superpowers/plans/CodeProve-Frontend-Refactor-Plan.md` là untracked |
| Source đã đọc | 69 file trong `app/`, `components/`, `lib/`; gồm 17 `page.tsx`, 36 file trong `components/` |
| Cấu hình đã đọc | `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.mjs`, `postcss.config.mjs`, `.gitignore`, `README.md`; chỉ đọc biến public API URL của `.env.local` |
| Tài liệu điều khiển | Toàn bộ plan Phase 0–7 và phụ lục; hướng dẫn AGENTS của người dùng và file ở thư mục cha |
| Ngoài phạm vi source | Dependencies `node_modules`, output `.next`, `.git`, cache và tài liệu lịch sử không phải implementation hiện tại |

Tag chỉ lưu commit đã theo dõi; plan đang untracked và tài liệu audit mới không nằm trong tag.

### Stack thực tế

- Dependencies trực tiếp: Next `14.2.15`, React/React DOM `^18.3.1`, Tailwind `^3.4.13`, TypeScript `^5.6.3`, Framer Motion, Lucide, Three.js, React Three Fiber/Drei, `react-resizable-panels`.
- Phiên bản cài local đã kiểm tra: React `18.3.1`, TypeScript `5.9.3`, Tailwind `3.4.19`.
- Chưa khai báo TanStack Query, Zustand, Monaco, React Hook Form, Zod, MSW hay Recharts là dependency trực tiếp. Có Zustand `5.0.14` trong `node_modules` nhưng chưa có store ứng dụng sử dụng nó; không coi Phase 2 đã được setup.
- Editor là textarea có overlay highlight và gutter tự viết. Chart là SVG tự vẽ. Không có test script/test suite hoặc cấu hình ESLint trong dự án hiện tại.

## II. Route, page và layout

Mỗi page dưới đây đã được đọc. Route group `(marketing)` không xuất hiện trong URL.

| URL | File | Component / hành vi chính |
|---|---|---|
| `/` | `app/(marketing)/page.tsx` | `HomePage`: Hero → TrustedBy → HowItWorks → About → Service → RubricShowcase → Pricing → Contact |
| `/pricing` | `app/(marketing)/pricing/page.tsx` | `PricingPage`: Pricing + FAQ + FinalCTA |
| `/students` | `app/(marketing)/students/page.tsx` | `StudentsPage` → PersonaPage |
| `/universities` | `app/(marketing)/universities/page.tsx` | `UniversitiesPage` → PersonaPage |
| `/employers` | `app/(marketing)/employers/page.tsx` | `EmployersPage` → PersonaPage |
| `/privacy` | `app/(marketing)/privacy/page.tsx` | `PrivacyPage` → LegalPage |
| `/terms` | `app/(marketing)/terms/page.tsx` | `TermsPage` → LegalPage |
| `/login` | `app/(marketing)/login/page.tsx` | `LoginPage` → AuthPanel(login), email/password và Google OAuth |
| `/signup` | `app/(marketing)/signup/page.tsx` | `SignupPage` → AuthPanel(signup) |
| `/auth/callback?token=…&error=…` | `app/auth/callback/page.tsx` | `AuthCallbackPage` → AuthCallbackClient; đổi token thành user qua `/auth/me`, redirect dashboard |
| `/dashboard` | `app/dashboard/page.tsx` | `DashboardPage`: KPI, radar, trend và recent attempts từ API |
| `/workspace` | `app/workspace/page.tsx` | `WorkspacePage` → WorkspaceLanding; 3 track, business cards đang khóa |
| `/workspace/[level]` | `app/workspace/[level]/page.tsx` | `LevelPicker`: fresher/junior/senior, slug khác → notFound; LevelExercises |
| `/workspace/solve?id=CP-001&level=fresher` | `app/workspace/solve/page.tsx` | `SolvePage` → SolveWorkspace; tra static exercise, fallback bài đầu Fresher khi ID không tìm thấy |
| `/feedback?attempt=<number>` | `app/feedback/page.tsx` | `FeedbackPage`: Suspense → FeedbackContent; báo cáo của attempt |
| `/profile` | `app/profile/page.tsx` | `ProfilePage`: tài khoản/avatar thật; preferences và integrations một phần local/mock |
| `/community` | `app/community/page.tsx` | `CommunityPage`: leaderboard/thread seed, bài đăng cá nhân lưu localStorage |

| Layout / metadata / component cùng thư mục page | Vai trò |
|---|---|
| `app/layout.tsx` — RootLayout | Inter, global CSS, metadata, ThemeProvider → I18nProvider → AuthProvider |
| `app/(marketing)/layout.tsx` — MarketingLayout | AmbientBackdrop + Navbar + main + Footer |
| `app/sitemap.ts` | Sinh `/sitemap.xml`, hiện dùng host placeholder `https://codeprove.example` |
| `app/robots.ts` | Sinh `/robots.txt`, disallow login/signup, sitemap placeholder |
| `app/auth/callback/AuthCallbackClient.tsx` | Pending/error OAuth; `loginWithToken`, `router.replace('/dashboard')` |
| `app/feedback/FeedbackContent.tsx` | Load report, score ring, axis bars, integrity badge, timeline, strengths/risks |
| `app/globals.css` | Dark/light tokens, marketing/app utilities, animation, reduced-motion, preview overrides |

**Auth boundary hiện tại:** không có `middleware.ts`, `(app)/layout.tsx`, cookie session hay server route guard trong source. Dashboard/workspace/feedback không redirect login tại page. Profile hiển thị thông báo chưa đăng nhập khi thiếu user. Không suy ra API backend cho phép truy cập trái phép từ việc frontend thiếu guard.

## III. Inventory component và thư viện

### Component files (36/36)

| File | Export / component nội bộ đáng chú ý | Vai trò / nơi dùng |
|---|---|---|
| `components/layout/Navbar.tsx` | Navbar | Marketing navigation, mobile menu, language/theme |
| `components/layout/Footer.tsx` | Footer | Marketing footer |
| `components/layout/AmbientBackdrop.tsx` | AmbientBackdrop | Decorative aura |
| `components/ui/Button.tsx` | Button | Link/button; primary/secondary/ghost/vivid, sm/md/lg |
| `components/ui/Logo.tsx` | Logo | SVG logo + link home |
| `components/ui/Reveal.tsx` | Reveal, Stagger, StaggerItem | Framer Motion wrappers |
| `components/ui/Toggles.tsx` | LanguageToggle, ThemeToggle | Đọc i18n/theme context; chưa phải primitives chỉ nhận props |
| `components/app/AppChrome.tsx` | AppTopNav, AppFooter, Sym, UserMenu; MaterialSymbolsFont nội bộ | App shell ngang; account menu/logout/profile; font Material Symbols |
| `components/app/WorkspaceLanding.tsx` | WorkspaceLanding | Chọn track và business placeholders |
| `components/app/LevelExercises.tsx` | LevelExercises | API list + static fallback, AND search/topic, sort, random highlight |
| `components/app/SolveWorkspace.tsx` | SolveWorkspace; ColResizeHandle nội bộ | Editor, Ciel, hypothesis, Run/Submit, attempt lifecycle, telemetry, autosave/fullscreen |
| `components/app/ExplainBackModal.tsx` | ExplainBackModal | Submit answers, chặn paste/drop, chuyển feedback |
| `components/app/ChatMarkdown.tsx` | ChatMarkdown | Paragraph/list/bold/inline code/fenced code; render React, không innerHTML |
| `components/three/HeroCanvas.tsx` | HeroCanvas | `next/dynamic`, `ssr:false`, kiểm tra WebGL/memory, theme |
| `components/three/HeroScene.tsx` | HeroScene | R3F Canvas/lights/Sparkles, pause frameloop khi offscreen |
| `components/three/FluencyCore.tsx` | FluencyCore; AxisNode nội bộ | Neural geometry, palette dark/light, animation và 6 axis labels |
| `components/three/HeroPoster.tsx` | HeroPoster | SVG fallback deterministic, rubric labels |
| `components/three/CircuitField.tsx` | CircuitField | Seeded SVG circuit animation |
| `components/sections/Hero.tsx` | Hero | Landing headline, CTA dashboard, 3D/circuit, IntersectionObserver |
| `components/sections/TrustedBy.tsx` | TrustedBy | Marquee partner placeholders |
| `components/sections/HowItWorks.tsx` | HowItWorks | 3 bước giải bài/ghi hành vi/chấm điểm |
| `components/sections/About.tsx` | About | Giới thiệu và pillars |
| `components/sections/Service.tsx` | Service | Offerings + WorkspaceMockup + integrity |
| `components/sections/RubricShowcase.tsx` | RubricShowcase | SVG radar trọng số marketing, hover axis cards |
| `components/sections/Pricing.tsx` | Pricing | Toggle Personal/Business; chưa Monthly/Annual |
| `components/sections/Contact.tsx` | Contact | Form `mailto:` + FAQ accordion; không POST API |
| `components/sections/AuthPanel.tsx` | AuthPanel; GoogleIcon, Field nội bộ | Manual form validation; auth context + OAuth navigation |
| `components/sections/FAQ.tsx` | FAQ | Accordion độc lập trên pricing |
| `components/sections/FinalCTA.tsx` | FinalCTA | Pricing CTA + HeroPoster |
| `components/sections/PersonaPage.tsx` | PersonaPage | Students/universities/employers |
| `components/sections/LegalPage.tsx` | LegalPage | Privacy/terms |
| `components/sections/WorkspacePreview.tsx` | WorkspaceMockup, WorkspacePreview | Mockup được Service dùng; wrapper WorkspacePreview chưa được mount bởi page hiện tại |
| `components/sections/Comparison.tsx` | Comparison | Component còn tồn tại, chưa mount bởi page hiện tại |
| `components/sections/Integrity.tsx` | Integrity | Component độc lập chưa mount; Service hiện render nội dung integrity |
| `components/sections/Personas.tsx` | Personas | Tabbed component còn tồn tại, chưa mount bởi page hiện tại |
| `components/sections/Problem.tsx` | Problem | Component thống kê còn tồn tại, chưa mount bởi page hiện tại |

Component cục bộ ngoài `components/`: `SettingRow`, `Toggle` trong ProfilePage; các page/layout/client component ở mục II; 3 providers trong bảng dưới. Các component chưa được mount vẫn giữ nguyên, Phase 0 không xóa.

### Library files (9/9)

| File | Context cần giữ |
|---|---|
| `lib/api.ts` | Base URL, bearer token helpers, apiFetch/error formatting, API types và endpoint helpers |
| `lib/auth.tsx` | AuthProvider/useAuth; login/signup/loginWithToken/updateProfile/logout |
| `lib/telemetry.ts` | createTelemetry: queue in-memory, flush mỗi 2 giây; lỗi thì đưa batch lại đầu queue; stop flush cuối |
| `lib/theme.tsx` | ThemeProvider/useTheme; dark mặc định; localStorage `codeprove-theme` |
| `lib/i18n.tsx` | I18nProvider/useI18n; vi mặc định; localStorage `codeprove-locale`, cập nhật html lang |
| `lib/content.ts` | Marketing copy vi/en, pricing tháng, rubric weights, persona/legal; không phải API response |
| `lib/appContent.ts` | App copy vi/en, labels report, legacy localization templates |
| `lib/exercises.ts` | 30 static exercises (12/10/8), types, TOPICS/RUBRIC, lookup, studentStarterFromCode, tokenizeLine |
| `lib/exerciseContentVi.ts` | Overlay summary/hint tiếng Việt theo exercise code; fallback tiếng Anh |

## IV. API contract baseline từ source

### Transport và auth chung

- URL: `${API_BASE}/api${path}`; `API_BASE` bỏ một slash cuối từ `NEXT_PUBLIC_API_URL`, fallback `http://localhost:8000`. Cấu hình local hiện cũng là URL này.
- Mặc định `GET`, `auth: true`. Mọi request qua wrapper đều có `Content-Type: application/json`; token tồn tại thì thêm `Authorization: Bearer <token>`.
- Token lưu bằng key `codeprove_token` trong localStorage. Không đọc cookie; không cấu hình `credentials` riêng. Login/signup dùng `auth:false`.
- Có body thì `JSON.stringify(body)`; không body thì `undefined`. Response thành công luôn parse JSON. Error không-ok: thử parse `detail`, hỗ trợ string hoặc array `{ msg, loc }`, rồi throw `Error` message; chưa có typed HTTP error/status ở caller.
- Có đúng một native `fetch(...)` trong source ứng dụng, ở wrapper này. Component đã không gọi native fetch trực tiếp, nhưng vẫn gọi service/context trực tiếp thay vì hooks TanStack Query.

### Endpoint inventory

Các response dưới đây là type frontend kỳ vọng, **chưa xác nhận bằng Network/backend**. Prefix `/api` đã được ghi đầy đủ.

| Method | Endpoint | Payload / query | Response kỳ vọng | Caller |
|---|---|---|---|---|
| POST | `/api/auth/login` | `{ email, password }`, không bearer | `{ user: User, access_token: string }` | AuthProvider.login ← AuthPanel |
| POST | `/api/auth/signup` | `{ full_name, email, password }`, không bearer | `{ user: User, access_token: string }` | AuthProvider.signup ← AuthPanel |
| GET | `/api/auth/me` | Không body | `User` trực tiếp, không bọc `{ user }` | AuthProvider mount nếu có token, loginWithToken; helper getMe chưa có caller |
| PATCH | `/api/auth/me` | `{ full_name?: string, avatar?: string \| null }` | `Me` | updateMe ← updateProfile ← ProfilePage; bỏ avatar gửi `""` |
| GET (navigation) | `/api/auth/google/start` | Không body; full-page navigation, không đi apiFetch | Luồng OAuth redirect, không có JSON response type ở frontend | AuthPanel.handleGoogleSignIn |
| GET | `/api/exercises` | `?level=<level>` tùy chọn | `LevelGroup[]` trực tiếp | getExercises ← LevelExercises |
| GET | `/api/exercises/:code` | Exercise code, không body | `ExerciseDetail` | getExerciseDetail ← SolveWorkspace |
| POST | `/api/attempts` | `{ exercise_code }` | `{ attempt_id: number, started_at: string }` | createAttempt ← SolveWorkspace mount |
| GET | `/api/attempts/:id` | Không body | `AttemptState` | getAttempt được định nghĩa; chưa tìm thấy caller hiện tại |
| POST | `/api/attempts/:id/events` | `{ events: Ev[] }` (helper nhận `unknown[]`) | `{ ingested: number }` | sendEvents ← createTelemetry |
| POST | `/api/attempts/:id/snapshots` | `{ version: number, source_code: string }` | `{ ok: boolean }` | saveSnapshot ← autosave và Run |
| POST | `/api/attempts/:id/run` | `{ source_code: string, run_tests: true }` | `RunResult` | runTests ← handleRunTests |
| POST | `/api/attempts/:id/mentor` | `{ message: string, code?: string }`; UI hiện luôn truyền code editor | `{ reply: string, injected_error: boolean }` | sendMentor ← handleChatSend |
| POST | `/api/attempts/:id/hypothesis` | `{ text: string }` | `{ correct: boolean, note: string }` | logHypothesis ← handleLogHypothesis |
| POST | `/api/attempts/:id/submit` | Query `locale=vi\|en`; **không body** | `{ questions: string[] }` | submitAttempt ← handleSubmit |
| POST | `/api/attempts/:id/explain-back` | `{ answers: { question: string, answer: string }[] }` | `ReportOut` | explainBack ← ExplainBackModal |
| GET | `/api/attempts/:id/report` | Không body | `ReportOut` | getReport ← FeedbackContent |
| GET | `/api/dashboard` | Không body | `DashboardOut` | getDashboard ← DashboardPage |

Đây là 18 cặp method/path frontend biết đến, gồm 1 helper endpoint chưa được gọi (`GET attempt`) và 1 OAuth navigation. Không có implementation backend trong folder này để kết luận danh sách endpoint phía server. Không tìm thấy frontend call newsletter, community, leaderboard hay integrations; contact chỉ mở email client.

### Response/entity shapes

```ts
type User = { id: number; full_name: string; email: string; avatar?: string | null };
// Me cùng shape User; AuthOut = { user: User; access_token: string }.
type ExerciseSummary = {
  id: number; num: number; code: string; title: string;
  difficulty: string; acceptance: number; topics: string[]; level: string;
  status?: string;
};
type LevelGroup = { level: string; name: string; exercises: ExerciseSummary[] };
type ExerciseDetail = ExerciseSummary & {
  kind?: "implement" | "debug"; summary: string; language: string;
  starter: string; hint: string; tests: string[]; rubric: [string, string][];
};
type AttemptState = {
  id: number; exercise_code: string; status: string;
  score: number | null; latest_code: string | null;
};
type Ev = {
  type: string; ts: number; payload?: Record<string, unknown>;
  integrity_flags?: string[];
};
type RunCase = { name: string; passed: boolean; stdout: string; error: string | null };
type RunResult = {
  passed: number; total: number; coverage: number;
  cases: RunCase[]; runtime_error: string | null;
};
type FeedbackItem = { axis: string; code?: string; note: string };
type TimelineItem = {
  key?: "hypothesis" | "implementation" | "explain_back";
  coverage_pct?: number | null; explain_score?: number;
  step: string; title: string; desc: string; active: boolean;
};
type ReportOut = {
  overall: number; tier: string;
  axes: Record<string, number | null>;
  axes_pct: Record<string, number | null>;
  feedback: {
    strengths: FeedbackItem[]; risks: FeedbackItem[];
    per_axis: Record<string, { score: number; notes: string[] }>;
    timeline?: TimelineItem[];
  };
  integrity_status: "green" | "yellow" | "red";
  timeline: TimelineItem[];
};
type DashboardOut = {
  kpis: { completed: number; streak: number; avg_score: number };
  radar: { name: string; value: number }[]; trend: number[];
  recent: { title: string; meta: string; status: string; score: number | null; ok: boolean }[];
};
```

### Ciel: hành vi phải đối chiếu trước/sau refactor

Nguồn: `lib/api.ts:161`, `components/app/SolveWorkspace.tsx:630`, `components/app/ChatMarkdown.tsx`.

1. Prompt từ input hoặc suggestion được `.trim()`; rỗng hoặc đang gửi thì không gọi API. Chưa có attempt ID thì return.
2. UI xóa input, append user message và đặt `chatSending=true` **trước** request.
3. Gửi `POST /api/attempts/<id>/mentor`, bearer như wrapper; payload `{ message: msg, code: editorCodeRef.current }`. `id` nằm trong URL, không có `sessionId`/`history` trong body.
4. Nhận `reply` → assistant message; `injected_error` → `verifyHint` và nhắc kiểm chứng. Không có `promptLogEntry` hay timestamp trong type response/message hiện tại.
5. Lỗi → append assistant message `[Error] <message>`; finally tắt sending. Input cũ không được khôi phục và chưa có nút retry riêng. Đây là baseline hiện tại; yêu cầu giữ input khi mất mạng ở Phase 5 là một thay đổi UI cần được theo dõi riêng.
6. History chỉ là state React của component ở frontend. Chưa xác minh được backend giữ context thế nào qua hội thoại thành công; không tự thêm `history` vào request.
7. ChatMarkdown render escape bằng React; không biến reply thành HTML thô. Ciel panel chỉ mount ở viewport từ 1280px; phần đề bài từ 1024px.

**Network baseline ban đầu (19/09/2026): PARTIAL.** Bằng chứng từ ba ảnh Headers/Payload/Response do người dùng cung cấp trong cuộc trao đổi; response thành công đã được bổ sung ngày 20/09 bên dưới:

| Trường | Quan sát từ ảnh |
|---|---|
| Request URL | `https://density-reed-conclusions-ticket.trycloudflare.com/api/attempts/91/mentor` |
| Method | `POST` |
| Status | `500 Internal Server Error` |
| Payload keys | `message`, `code`; khớp call site trong source |
| Message | `giải thích bài này` |
| Code | Hàm `def two_sum(nums, target):` với thân `pass` ở dòng kế tiếp |
| Response tab | `Failed to load response data` / `No data found for resource with given identifier` |

Ảnh Response thể hiện DevTools không lấy được dữ liệu để hiển thị, **không phải response body do backend trả về**, và không chứng minh body rỗng. HTTP 500 chưa đủ xác định nguyên nhân; API key bị revoke là thông tin người dùng cung cấp, chưa được xác nhận bằng response/log backend. Không suy ra lỗi frontend từ status này. Host tunnel là môi trường website được chụp, không thay cho cấu hình local hoặc base URL cố định của ứng dụng.

Nguồn ảnh: `codex-clipboard-8276aeef-68ee-4f88-b4d8-6bfaa8fa0d72.png` (Headers), `codex-clipboard-0ecc7aef-1b8a-4966-8a98-69529b662f6e.png` (Payload), `codex-clipboard-aafdd41b-1a37-48aa-af20-8de88829f184.png` (Response), đính kèm trong cuộc trao đổi. Không lưu credential vào audit.

**Bổ sung live ngày 20/09/2026: đã đối chiếu response thành công.** Gửi HTTP POST thật bằng tài khoản QA riêng: tunnel mới trả 200 cho attempt 94 (3.352 ms); backend local `http://localhost:8000` trả 200 cho attempt 21 (4.150 ms). Cả hai nhận body `{ message, code }` và trả đúng hai trường `reply` (string không rỗng), `injected_error` (boolean, giá trị `true`). Đây là bằng chứng HTTP trực tiếp, bổ sung cho ảnh DevTools ban đầu; không phải ảnh Network mới. Xem request, thời điểm UTC và JSON response đã loại credential trong [Ciel live verification](docs/superpowers/plans/CodeProve-Ciel-Live-Verification.md).

Phần baseline contract Ciel còn thiếu của Phase 0 đã được xác minh. Các case context, attempt không tồn tại và mất mạng vẫn thuộc kiểm thử Phase 2/5; hai response thành công không chứng minh toàn bộ các case đó đạt.

## V. Luồng hoạt động và khác biệt so với plan

### Golden path thực tế theo source

`Landing → Login/Signup → Dashboard → /workspace → /workspace/<level> → /workspace/solve?id=<code>&level=<level> → fullscreen → Run/Ciel/Submit → ExplainBackModal → /feedback?attempt=<id>`.

Hero hiện link thẳng `/dashboard`; frontend chưa bắt login ở route này. Khi SolveWorkspace mount, nó lấy detail (fallback static), rồi tạo attempt mới; không resume bằng getAttempt. Starter editor lấy từ static: bài debug giữ nguyên, bài implement qua `studentStarterFromCode`; detail API chỉ bổ sung briefing/language. Tiếng Việt dùng overlay cục bộ cho summary/hint.

- Run: save snapshot tăng version → run với `source_code` → hiển thị Pending/Pass/Fail và runtime error; nút Run disable trong khi chạy.
- Submit: forced autosave → stop/flush telemetry best-effort → submit theo locale → nhận questions → Explain-back gửi answers → chuyển feedback. Không bắt buộc Run trước. Submit không gửi `{ code }`.
- Fullscreen bắt đầu timer 45 phút; rời fullscreen khóa giao diện; hết giờ log event và forced save. Autosave mỗi 12 giây sau khi bắt đầu fullscreen và lúc hidden/blur/pagehide/beforeunload.
- Telemetry gồm OPEN, CODE_EDIT (debounce 500ms), AUTO_SAVE/AUTO_SAVE_FAILED, TIMER_START/TIMER_EXPIRED, FULLSCREEN_ENTER/EXIT/UNSUPPORTED/FAILED, TAB_HIDDEN/VISIBLE, WINDOW_BLUR/FOCUS, PASTE_BLOCKED, COPY/CUT. Không bỏ các hành vi này khi tách component.
- AuthProvider mount ở root nên marketing cũng có thể gọi `/auth/me` nếu localStorage có token, dù nội dung landing/pricing là tĩnh.

### Điểm cần mang sang các phase sau, chưa sửa trong audit

| Plan / phase | Hiện trạng hoặc khoảng trống |
|---|---|
| `src/` và 3 lớp | Code nằm ở root `app/components/lib`, alias `@/* → ./*`; chưa có hooks/stores/service folders. Việc di chuyển phải cập nhật alias/Tailwind scan, không tạo hai app roots song song. |
| Phase 1: “giữ” teal/background | Dark đang `#101415`, primary `#b6c4ff`, primary-container `#0055ff`; light `#faf8ff`. Teal `#3ed4c5` còn ở một số SVG/3D. Plan yêu cầu `#070b0f`/`#3ed4c5` là thay đổi so với baseline. |
| Phase 1: không hardcode màu | Có màu hardcode trong CSS, Tailwind config, SVG/logo/GoogleIcon, 3D palettes, nhiều sections. Không giới hạn rà soát vào `components/ui` rồi kết luận toàn app sạch. |
| Phase 2: Ciel/service | Chỉ tách vị trí và orchestration, giữ endpoint mentor và shape thực tế. Wrapper đã tồn tại, không cần sáng tạo contract thay thế. |
| Phase 3: Three.js | `HeroCanvas` đã dùng dynamic + `ssr:false`; có offscreen pause và SVG fallback. Reduced-motion hiện tắt rotate nhưng vẫn còn pulse trong useFrame. README có mô tả cũ. |
| Phase 3: preview/pricing | Preview đang là mockup, chưa screenshot workspace thật. Giá chỉ có tháng (Free/Plus/Pro), không có annual price/discount được duyệt; không tự đặt mức giảm. |
| Phase 4: auth | Không có session/cookie sẵn như giả định; localStorage token không đọc được tại server component. Server guard cần giải quyết constraint giữ auth trước khi triển khai. |
| Phase 4: problems | List nằm ở level page, gọi `/exercises?level=…`, trả groups; search/topic lọc client theo AND, chưa debounce/loading/error-retry theo plan. Không có evidence API hỗ trợ `topic/search`. |
| Phase 5: session route | `/workspace/[level]` đang chiếm dynamic segment. Không thể thêm sibling `[sessionId]` mà bỏ qua xung đột route; phải xử lý migration và link cũ. |
| Phase 5: submit/report | Explain-back là một phần golden path đang chạy theo source. Không thay bằng submit → report ngay, không giả định submit chạy hidden tests hoặc trả submitted status. |
| Phase 5: context/PromptLog | Không có history trong mentor request hay promptLogEntry trong response. Không tự thêm trường API; thứ tự hội thoại hiện do append state. |
| Phase 6: report | Report hiện là score ring + axis bars, không phải report radar. `integrity_status` đơn, chưa có danh sách integrityFlags/stats run-count/question-count/duration trong type. |
| Phase 6: missing fields | `Object.entries(report.axes_pct)`, `report.timeline.map`, feedback arrays đang giả định tồn tại. Null axis value có xử lý; object thiếu field chưa có bằng chứng an toàn. |
| Sidebar Progress/Leaderboard | Chưa có route/API thật riêng. Community leaderboard là mock; không dùng để tuyên bố có server leaderboard. |
| DoD lint/test | Chưa cài/config ESLint; chưa có automated test suite/MSW. Build thành công không chứng minh lint hoặc golden path live đạt. |

## VI. Kết quả kiểm tra đã chạy

| Kiểm tra | Kết quả / bằng chứng |
|---|---|
| TypeScript strict | `tsconfig.json`: `strict: true` đã có; không sửa cấu hình |
| TypeScript baseline | `node node_modules/typescript/bin/tsc --noEmit --incremental false` → exit 0, **0 lỗi**. Tắt incremental để tránh ghi cache khi khảo sát. |
| Production build | `npm.cmd run build` → exit 0, compiled successfully, generated 21/21 static-page build tasks. Lần sandbox ban đầu lỗi `spawn EPERM`; đã chạy lại ngoài sandbox với quyền được cấp. |
| Build size tham chiếu | First Load JS landing 157 kB; workspace/solve 144 kB; shared 87.3 kB. Đây không phải điểm Lighthouse. |
| Lint | `npm.cmd run lint` hiện wizard “How would you like to configure ESLint?”; chưa có eslint/eslint-config-next. Chưa chạy lint rules, không đánh dấu sạch; không cài thêm ở Phase 0. |
| API local | GET `http://localhost:8000/openapi.json`, timeout tối đa 5s → connection refused. Người dùng xác nhận chưa mở backend. |
| Native fetch inventory | Search trên app/components/lib: duy nhất `lib/api.ts:58`; các caller liệt kê ở mục IV. |
| Tag | `git rev-parse pre-refactor` = `git rev-parse HEAD` = commit baseline |
| Network Ciel do người dùng cung cấp | Đã đối chiếu ảnh request mentor attempt 91: POST, body message/code, HTTP 500; response body không xem được trong DevTools |
| Ciel thành công, bổ sung 20/09 | HTTP POST mentor trên tunnel attempt 94 và local attempt 21 đều 200; response thực tế khớp `{ reply: string, injected_error: boolean }` |
| Golden path, bổ sung 20/09 | Phase 1 local: Login/Dashboard/Workspace → Ciel hai lượt → Run 2/2 PASS → Submit → Explain-back → Report attempt 22; console error/warn `[]`. Chi tiết trong `CodeProve-Phase-1-Verification.md` |
| Browser console / responsive / Lighthouse | Chưa kiểm tra trong audit; không đánh dấu các DoD này đạt |

## VII. Checklist Phase 0 và bước xác minh còn lại

- [x] Đọc source và toàn bộ refactor plan.
- [x] Có inventory đầy đủ page/route/component/API call trong `AUDIT.md`.
- [x] Có local tag `pre-refactor` trước khi thay đổi frontend.
- [x] Đã biết TypeScript baseline: strict, 0 lỗi.
- [x] Ghi contract Ciel từ source và cập nhật Phụ lục A, phân biệt với live evidence.
- [x] Đối chiếu Network request Ciel thật từ ảnh người dùng: method, endpoint, payload và status 500.
- [x] Đối chiếu response body Ciel thành công: HTTP thật trên tunnel và local ngày 20/09/2026; bằng chứng đã loại credential được liên kết ở mục IV.

Đã hoàn tất baseline Ciel còn thiếu ở Phase 0. Không suy ngược nguyên nhân của HTTP 500 cũ từ lần gọi thành công mới. Không ghi bearer token, mật khẩu hoặc dữ liệu cá nhân vào audit. Các case context/lỗi và golden path của Phase 2/5 vẫn theo phase tương ứng.

Phạm vi audit Phase 0 ban đầu chỉ ghi nhận và tài liệu hóa, không sửa code. Phase 1 đã được triển khai riêng sau khi người dùng cho phép; trạng thái nghiệm thu nằm trong `CodeProve-Phase-1-Verification.md`, chưa merge vào `main`.
