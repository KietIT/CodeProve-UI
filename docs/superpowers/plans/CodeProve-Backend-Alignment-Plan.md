# CodeProve — Backend Alignment Plan (derived from frontend)

- Ngày: 2026-09-21. Nguồn sự thật: **frontend** (`lib/api/*`, `lib/types/*`, `lib/dailyApi.ts`, `lib/auth.tsx`).
- Mục tiêu: liệt kê **chính xác** những gì frontend gọi và kỳ vọng, để backend chỉnh cho khớp — frontend gọi được backend và ngược lại.
- Quy ước: ✅ đã có (theo baseline Phụ lục A của refactor plan) · 🆕 mới, cần backend làm · ⚠️ cần rà/điều chỉnh cho khớp shape.

---

## 0. Cross-cutting (áp cho MỌI endpoint)

| Hạng mục | Frontend làm gì | Backend cần đảm bảo |
|---|---|---|
| Base URL | `NEXT_PUBLIC_API_URL` (mặc định `http://localhost:8000`), wrapper nối thêm `/api`. Mọi path dưới `<base>/api/...` | Phục vụ dưới prefix `/api`. Prod: set `NEXT_PUBLIC_API_URL` trỏ domain backend thật |
| Auth | Header `Authorization: Bearer <token>`; token lưu localStorage `codeprove_token`. login/signup **không** gắn bearer | Chấp nhận bearer; login/signup **trả** `access_token`; các route cần auth đọc bearer |
| Error shape | `formatApiError` đọc field **`detail`**: là `string` hoặc mảng `[{ msg, loc }]` (kiểu FastAPI) | Lỗi trả **non-2xx** + body `{ detail: string \| [{msg, loc}] }`. FE ném `ApiError` kèm `status` |
| Content-Type | Gửi/nhận `application/json` | JSON in/out |
| **CORS** | Gọi cross-origin từ origin của FE | **Allow origin FE** (dev `http://localhost:3000`, prod domain Vercel) + preflight cho `POST/PATCH`, headers `Authorization, Content-Type`. **Đã từng chặn khi test** — ưu tiên cấu hình đúng |

---

## 1. Auth — ✅ đã có (giữ nguyên, chỉ đảm bảo shape)

| Method | Path (dưới `/api`) | Request | Response FE kỳ vọng |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ access_token: string, user: User }` |
| POST | `/auth/signup` | `{ full_name, email, password }` | `{ access_token, user }` |
| GET | `/auth/me` | — (bearer) | `User` trực tiếp |
| PATCH | `/auth/me` | `{ full_name?, avatar? }` | `User` |
| GET (nav) | `/auth/google/start` | full-page redirect | OAuth flow → callback trả token |

`User = { id: number; full_name: string; email: string; avatar?: string \| null }`.

⚠️ **OAuth redirect origin (bug đã gặp khi dev):** FE gọi `GET <API_BASE>/api/auth/google/start?redirect=<origin>/auth/callback` — nay **có kèm `redirect`** = origin hiện tại (localhost khi dev, domain khi prod). Toàn bộ quyết định redirect cuối do **backend**; trước đây backend hardcode về production `code-prove.vercel.app` nên dev trên localhost:3000 vẫn bị đẩy sang prod. **Backend cần:**
1. Đọc query `redirect`, **validate theo allowlist** (`http://localhost:3000`, domain Vercel prod) để tránh open-redirect; dùng nó làm URL trả về sau OAuth. Không có/không hợp lệ → fallback URL mặc định theo env.
2. `redirect_uri` gửi cho Google (callback của backend) phải khớp **Authorized redirect URIs** trong Google Cloud Console — thêm cả bản dev (`http://localhost:8000/...`).
3. Dev: FE đặt `.env.local` `NEXT_PUBLIC_API_URL=http://localhost:8000` để OAuth start trỏ backend local; backend local cấu hình allow `http://localhost:3000`.

FE `/auth/callback` đọc token từ URL rồi gọi `/auth/me`.

---

## 2. Exercises — ✅ có, ⚠️ rà field cho ProblemTable

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/exercises` (+ `?level=` tùy chọn) | — | `LevelGroup[]` |
| GET | `/exercises/:code` | — | `ExerciseDetail` |

```ts
LevelGroup = { level: string; name: string; exercises: ExerciseSummary[] }
ExerciseSummary = { id, num, code, title, difficulty: string, acceptance: number,
                    topics: string[], level: string, status?: "solved"|"attempted"|"todo" }
ExerciseDetail = ExerciseSummary & { kind?: "implement"|"debug"; summary; language;
                    starter; hint; tests: string[]; rubric: [string,string][] }
```

⚠️ **ProblemTable (trang `/problems`) lọc client-side** theo `difficulty`, `topics`, `level` và search title/code. Backend **không cần** thêm query `?topic=`/`?search=` (FE tự lọc), nhưng **nên trả đủ** `topics`, `difficulty`, `acceptance`, và `status` per-user (nếu có auth). Thiếu `status` → cột trạng thái hiện "—" (không lỗi).

---

## 3. Attempts (lifecycle Workspace) — ✅ có

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/attempts` | `{ exercise_code }` | `{ attempt_id: number, started_at: string }` |
| GET | `/attempts/:id` | — | `AttemptState { id, exercise_code, status, score: number\|null, latest_code: string\|null }` |
| POST | `/attempts/:id/events` | `{ events: [{ type, ts, payload?, integrity_flags? }] }` | `{ ingested: number }` |
| POST | `/attempts/:id/snapshots` | `{ version: number, source_code: string }` | `{ ok: boolean }` |
| POST | `/attempts/:id/run` | `{ source_code, run_tests: true }` | `RunResult` |
| POST | `/attempts/:id/hypothesis` | `{ text }` | `{ correct: boolean, note: string }` |

```ts
RunResult = { passed: number; total: number; coverage: number;
  cases: { name: string; passed: boolean; stdout: string; error: string|null }[];
  runtime_error: string | null }
```
⚠️ FE `ResultTabs`/Run phân biệt **Pass/Fail/Pending** — mỗi case cần `passed` rõ ràng; `error` != null coi như fail có thông báo; `runtime_error` cho lỗi cú pháp/thực thi (không crash UI).

---

## 4. Ciel (mentor) — ✅ có, GIỮ NGUYÊN tuyệt đối

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/attempts/:id/mentor` | `{ message: string, code?: string }` | `{ reply: string, injected_error: boolean }` |

FE gọi qua hook `useCiel` nhưng **shape không đổi** so với baseline (Phụ lục A đã verify live 20/09). **Không thêm** `history`/`sessionId`/`promptLogEntry` vào response. `injected_error` điều khiển nhắc kiểm chứng.

---

## 5. Report (Submit → Explain-back → Report) — ✅ có

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/attempts/:id/submit` | query `?locale=vi\|en`, **không body** | `{ questions: string[] }` |
| POST | `/attempts/:id/explain-back` | `{ answers: [{ question, answer }] }` | `ReportOut` |
| GET | `/attempts/:id/report` | — | `ReportOut` |

```ts
ReportOut = { overall: number; tier: string;
  axes: Record<string, number|null>; axes_pct: Record<string, number|null>;
  feedback: { strengths: FeedbackItem[]; risks: FeedbackItem[];
              per_axis: Record<string,{score:number;notes:string[]}>; timeline?: TimelineItem[] };
  integrity_status: "green"|"yellow"|"red"; timeline: TimelineItem[] }
```
⚠️ Report page (Phase 6, chưa build) sẽ render 6 trục radar + integrity flag; backend giữ đúng `axes`/`integrity_status`. `submit` khi chưa đủ điều kiện nên trả 4xx rõ để FE hiện "Báo cáo chưa sẵn sàng".

---

## 6. Dashboard — ✅ có

| Method | Path | Response |
|---|---|---|
| GET | `/dashboard` | `{ kpis:{completed,streak,avg_score}, radar:[{name,value}], trend:number[], recent:[{title,meta,status,score:number\|null,ok:boolean}] }` |

---

## 7. Daily Bug Hunt — ✅ có (shapes trong `lib/dailyApi.ts`)

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/daily/today` | — | `DailyChallenge` |
| POST | `/daily/attempt` | `DailyAttemptInput` | `DailyAttemptResult` |
| POST | `/daily/claim-streak` | `{ history }` | `{ streak: number }` |

Shapes chi tiết ở `lib/dailyApi.ts` (đã chạy). Không đổi.

---

## 8. 🆕 Practice / Visualizer trace — CẦN LÀM (feature mới)

Đây là **phần backend mới duy nhất**. FE đã build xong và verify với mock; giờ backend làm endpoint khớp `mocks/traceSample.ts`.

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/practice/trace` | `{ source_code: string, stdin?: string }` | `TraceResponse` |

```ts
TraceResponse = { frames: TraceFrame[]; stdout: string; error?: string }
TraceFrame = { line: number; event: "line"|"call"|"return"; locals: Record<string, VizValue> }
VizValue =
  | { kind: "scalar"; value: string }
  | { kind: "array"; items: string[]; ptrs?: Record<string, number> }   // ptr: tên biến → index
  | { kind: "map"; entries: [string, string][] }
```

**Cách làm (Python, tái dùng sandbox của `/run`):**
1. Chạy `source_code` trong **cùng sandbox cô lập** như `/attempts/:id/run` (no network, giới hạn tài nguyên).
2. Gắn `sys.settrace(tracer)`; trong `tracer(frame, event, arg)`:
   - Chỉ ghi event `"line"` (MVP). Lấy `frame.f_lineno` → `line`, `frame.f_locals` → serialize.
   - **Serialize từng biến → VizValue:**
     - `int/float/str/bool` → `{ kind:"scalar", value: str(v) }`
     - `list`/`tuple` toàn scalar → `{ kind:"array", items:[str(x)…], ptrs:{} }`
     - `dict` → `{ kind:"map", entries:[[str(k),str(v)]…] }`
     - còn lại → `{ kind:"scalar", value: repr(v) }`
3. **`ptrs` (con trỏ mảng):** với mỗi biến `array` đang hiện và mỗi biến `int` local có `0 <= val < len(array)`, gắn `ptrs[tênBiếnInt] = val`. (Heuristic khớp thiết kế; FE cũng có fallback nhưng ưu tiên backend gắn.)
4. **Giới hạn:** cap **≤ 500 frames** + **timeout ~2–3s**. Vượt → cắt bớt và set `error` (vd "Đã đạt giới hạn số bước"). Exception khi chạy → `error = str(exc)`, `frames` có thể rỗng (FE hiện lỗi gọn).
5. Auth: `/practice` đang sau guard `(app)` → FE gửi bearer. Endpoint **nên yêu cầu auth** như các route khác. (Nếu sau này làm playground công khai, bỏ guard cả 2 phía.)

**Tiêu chí khớp:** POST `{ source_code: "<Two Sum>" }` phải trả `frames` cùng dạng `mocks/traceSample.ts` (line + locals: `nums` array có `ptrs.i`, `seen` map, scalars). Đối chiếu trực tiếp file mock.

---

## 9. Checklist bàn giao backend

- [ ] CORS allow origin FE (dev `localhost:3000` + prod) cho `GET/POST/PATCH` + headers `Authorization,Content-Type`.
- [ ] Lỗi trả `{ detail }` non-2xx (string hoặc `[{msg,loc}]`).
- [ ] 🆕 `POST /api/practice/trace` theo mục 8, đối chiếu `mocks/traceSample.ts`.
- [ ] Rà `/exercises` trả đủ `topics/difficulty/acceptance/status` cho ProblemTable.
- [ ] `submit` trả 4xx rõ khi report chưa sẵn sàng.
- [ ] Giữ nguyên tuyệt đối shape `/attempts/:id/mentor` (Ciel).

## 10. Frontend làm sau khi backend xong

- Bỏ `NEXT_PUBLIC_MOCK_TRACE` → `traceCode` tự trỏ endpoint thật (không đổi UI).
- Chạy lại golden path thật (login → workspace → run/ciel/submit → report) trên origin được allow.
- (Tùy chọn) chuyển `/practice` ra ngoài `(app)` nếu muốn playground công khai.
