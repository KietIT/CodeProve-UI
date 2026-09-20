# CodeProve — Algorithm Visualizer (Design)

- Ngày: 2026-09-20. Trạng thái: **thiết kế đã duyệt**, chưa implement.
- Nguồn: brainstorming với người dùng (quyết định ghi ở mục "Quyết định").
- Cảm hứng: phần code-playground tương tác của joinai.com (đề bài + Run + test results). Người dùng muốn đi xa hơn: **cho user nhìn thuật toán chạy từng bước**.
- Quan hệ với refactor plan: đây là **feature mới, cross-stack**, tách khỏi Phase 5. Không trộn vào việc componentize workspace. Xem [CodeProve-Frontend-Refactor-Plan.md](CodeProve-Frontend-Refactor-Plan.md).

---

## Quyết định (đã chốt khi brainstorm)

| Câu hỏi | Quyết định |
|---|---|
| Kiểu visualization | Step-through **biến** (mọi bài) + animate **cấu trúc dữ liệu** khi bài có (tùy bài) |
| Nguồn dữ liệu "từng bước" | **Backend trả execution trace** (endpoint mới + tracer) — chuẩn nhất, đúng code thật của sinh viên |
| Bối cảnh | **Mode luyện tập/học** (không chấm điểm, không anti-cheat) — chạy code sinh viên tự do, không ảnh hưởng toàn vẹn bài chấm |
| Phạm vi MVP | **Mảng 1 chiều + biến** (Two Sum, sorting, two-pointer). Hoãn cây/đồ thị/stack/queue |
| Vị trí | **Mode workspace "practice" riêng** (`/practice`), không phải trong attempt chấm điểm |
| Editor | Giữ editor hiện có (không Monaco) — thống nhất với quyết định Phase 5 |
| Views (rút gọn) | Bỏ `CallStackView` cho gọn ở MVP |

**Cross-stack:** feature này **vượt ranh giới frontend-only** của plan refactor. Backend team cần làm endpoint trace; frontend thiết kế contract và build/test trước bằng **MSW mock** để không bị chặn.

---

## Kiến trúc & Data flow

```
[Practice editor] --bấm Visualize--> useTrace() (useMutation)
        --> POST /api/practice/trace { source_code }
        --> TraceResponse { frames[] }
        --> useVisualizerStore.setFrames(frames)   (Zustand, UI state)
        --> views render theo frames[step]; StepPlayer đổi step
```

- **Server state** (kết quả trace) đi qua TanStack Query (`useTrace` mutation), rồi đổ vào **Zustand** để điều khiển bước — đúng phân tách server-state / UI-state của refactor.
- Không chạy code ở client (không Pyodide ở MVP).

---

## Contract frontend ↔ backend (đề xuất)

Endpoint (backend làm): `POST /api/practice/trace`
- Request: `{ source_code: string, stdin?: string }`
- Response:

```ts
type TraceResponse = { frames: TraceFrame[]; stdout: string; error?: string };

type TraceFrame = {
  line: number;                        // dòng đang thực thi (1-based)
  event: "line" | "call" | "return";
  locals: Record<string, VizValue>;    // biến trong scope hiện tại
};

type VizValue =
  | { kind: "scalar"; value: string }
  | { kind: "array"; items: string[]; ptrs?: Record<string, number> } // ptr: tên biến → index (i, j, left…)
  | { kind: "map"; entries: [string, string][] };                     // dict/hash — MVP nhận nhưng chỉ hiện text
```

Ràng buộc tracer (backend): giới hạn **≤ 500 frames** và timeout để chặn vòng lặp vô hạn; sandbox như runner hiện tại; `error` chứa exception/timeout để UI hiện gọn.

`ptrs` (biến int nào là con trỏ mảng): **backend gắn** nếu được; nếu không, frontend heuristic "biến int nằm trong [0, len(array))" — MVP ưu tiên backend gắn.

---

## Frontend — thư mục & thành phần

```
lib/types/trace.ts               -> TraceFrame, VizValue, TraceResponse
lib/api/practice.ts              -> traceCode(source_code): Promise<TraceResponse>
hooks/useTrace.ts                -> useMutation bọc traceCode (giống useCiel)
lib/stores/useVisualizerStore.ts -> { frames, step, status, playing, speed, setFrames, next, prev, goto, play, pause, reset }
components/visualizer/
  VisualizerPanel.tsx  -> khung: editor hiện có + nút Visualize + player + views
  StepPlayer.tsx       -> ◀ ▎▶ ▶ + scrubber + "Bước x/n" + tốc độ 0.5x/1x/2x
  VariablesView.tsx    -> bảng biến hiện tại (VizValue → text), highlight biến vừa đổi
  ArrayView.tsx        -> ô mảng 1D + nhãn con trỏ (i/j/left), ô active sáng, hoán đổi có transition
  CodeTrace.tsx        -> code + highlight dòng frames[step].line
app/(app)/practice/page.tsx  -> mode luyện tập (trong shell (app), có guard)
mocks/handlers.ts            -> MSW handler POST /api/practice/trace trả trace mẫu Two Sum
```

**Store (Zustand `useVisualizerStore`):** `frames`, `step`, `status: idle|loading|ready|error`, `playing`, `speed`. `play` dùng `setInterval` theo `speed`, tự dừng ở frame cuối. Là **UI state thuần** (không nhét vào TanStack Query).

**Render:** `frame = frames[step]` → `CodeTrace` highlight `frame.line`; `VariablesView` đọc `frame.locals`; `ArrayView` lấy `VizValue.kind==="array"` đầu tiên trong locals (MVP) vẽ ô + `ptrs`. Đổi `step` → mọi view đồng bộ, transition mượt.

---

## MVP — làm gì

1. `lib/types/trace.ts` + `lib/api/practice.ts` + `hooks/useTrace.ts` + `lib/stores/useVisualizerStore.ts`.
2. `components/visualizer/*` (không có `CallStackView`).
3. `app/(app)/practice/page.tsx` — editor + Visualize + player + views.
4. Animate **mảng 1D** + **step-through biến** cho mọi bài. `map`/dict: nhận contract nhưng hiện dạng text.
5. **MSW** mock endpoint trace (trace mẫu Two Sum) để hoàn thiện + demo trước khi backend xong.

## Testing

- Unit (Node `--test`, như hiện tại): `useVisualizerStore` (next/prev/goto/clamp biên, play dừng cuối); hàm thuần `VizValue → view model` cho `ArrayView`/`VariablesView`.
- Build/tsc/lint xanh; smoke browser mode practice với MSW.

## Loại trừ (YAGNI — KHÔNG làm ở MVP)

- Cây/đồ thị/stack/queue animation; render map/dict trực quan.
- Visualize trong lúc chấm điểm; replay trên trang Report.
- Chạy code client-side (Pyodide).
- Edit-and-re-visualize realtime (chỉ chạy khi bấm Visualize).

## Rủi ro & giảm thiểu

- **Trace lớn (nhiều frame):** giới hạn ≤ 500 + scrubber để nhảy nhanh.
- **Suy luận con trỏ (`ptrs`):** MVP ưu tiên backend gắn; fallback heuristic int-in-range.
- **Phụ thuộc backend:** không chặn frontend nhờ MSW mock; ghi rõ contract để bàn giao backend team.

## Bàn giao backend (tóm tắt)

- Endpoint `POST /api/practice/trace`, input `{ source_code, stdin? }`.
- Chạy trong sandbox + `sys.settrace`; trả `TraceResponse` khớp contract trên.
- Giới hạn frames/time; `error` cho exception/timeout.
