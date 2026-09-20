# Ciel — bổ sung baseline Phase 0 và nghiệm thu Phase 1

Ngày kiểm tra: 20/09/2026. Frontend Phase 1 trên branch `refactor/phase-1-design-system`, baseline `7c717e3`; không đổi code API/Ciel trong lần kiểm tra này. Dùng tài khoản QA riêng và bài CP-001; không thao tác bài làm đang mở của người dùng.

## HTTP request/response thực tế

| Môi trường | Thời điểm UTC | Endpoint | Status | Thời gian |
|---|---|---|---|---|
| Tunnel `simultaneously-interim-poster-reasoning.trycloudflare.com` | 2026-09-20 01:52:22.606 | `POST /api/attempts/94/mentor` | 200 | 3.352 ms |
| Local `http://localhost:8000` | 2026-09-20 11:44:16.151 | `POST /api/attempts/21/mentor` | 200 | 4.150 ms |

Hai request cùng JSON body:

```json
{
  "message": "Giải thích hướng tiếp cận hash map cho bài Two Sum và độ phức tạp. Chưa cần viết code hoàn chỉnh.",
  "code": "def two_sum(nums, target):\n    pass"
}
```

Response thực tế của cả hai có đúng hai keys: `reply` là string không rỗng, `injected_error` là boolean `true`. Reply giải thích hash map, phần bù và độ phức tạp O(n), có Markdown và code Python. Không suy ra chất lượng sư phạm hay độ chính xác của cờ từ kiểm tra shape này; nội dung LLM không phải snapshot cố định cho lần gọi sau.

JSON đã loại credential: [tunnel](evidence/ciel-tunnel-2026-09-20.json), [local](evidence/ciel-local-2026-09-20.json). Không lưu API key, bearer token, password hoặc hồ sơ tài khoản vào evidence.

Phương pháp: gửi HTTP thật tới backend, đọc status và parse JSON; đây không phải mock hay chỉ đọc TypeScript type. Kết hợp với ảnh DevTools request trước đó do người dùng cung cấp, bằng chứng này hoàn tất đối chiếu method, endpoint, payload và response shape còn thiếu ở Phase 0. Không có ảnh Network mới; công cụ trình duyệt hiện không cung cấp capture request/response.

## Kiểm tra UI Phase 1

Frontend chạy tại `http://localhost:3000` với `NEXT_PUBLIC_API_URL=http://localhost:8000`. Đăng nhập tài khoản QA, Dashboard, chọn Fresher và mở Workspace CP-001 đều thành công. Ciel panel, input và suggestions render; Send bị disabled khi input rỗng.

Người dùng đã bấm Start Attempt trực tiếp để vào fullscreen, vượt giới hạn tương tác của công cụ mà không sửa/bỏ guard. Sau đó đã hoàn tất golden path trên attempt **22** qua UI thật:

| Bước | Quan sát |
|---|---|
| Giả thuyết | Ghi hướng hash map O(n); UI nhận “Cách tiếp cận của bạn là chính xác và hiệu quả.” |
| Ciel lượt 1 | Hỏi vì sao tra phần bù trước khi thêm phần tử, với `[3,3]`, target 6; reply render Markdown, giải thích hai chỉ số khác nhau và hiện nhắc “Hãy kiểm chứng kỹ trước khi tin.” |
| Trạng thái gửi | Input được xóa, Send và suggestions disabled trong lúc “Ciel đang suy nghĩ…”; sau response suggestions được bật lại, Send vẫn disabled khi input rỗng |
| Editor / Run | Nhập lời giải hash map; `test_basic_case` và `test_duplicates` đều PASS, **2/2**, coverage **100%**; trạng thái autosave cập nhật Saved |
| Ciel lượt 2 | Hỏi test số âm và không có nghiệm; nhận ví dụ `[-1,-2,-3,-4]`, target -5 và `[1,2,3]`, target 7; hai lượt user/assistant hiển thị đúng thứ tự |
| Submit | Mở Explain-back với hai câu hỏi về từ điển và cách tìm hai chỉ số |
| Explain-back | Gửi hai câu trả lời; form disabled khi đang gửi, rồi chuyển tới `/feedback?attempt=22` |
| Report | Hiển thị 69/100, hạng Đang phát triển; sáu trục 84/85/55/90/60/0%; timeline, điểm mạnh, điểm cần tập trung và badge “Toàn vẹn: Cần xem lại”; Explain-back 16/20 |
| Console | Công cụ đọc console trả `[]` cho error/warn sau Submit và sau Report |

**Kết luận: PASS cho golden path Phase 1 với backend local**, nối từ Landing/Login/Dashboard/Workspace đã kiểm tra ở lượt trước tới Report ở lượt này. Badge integrity là dữ liệu của bài QA, không coi là lỗi render; chưa chẩn đoán nguyên nhân của trạng thái đó. Đây là kiểm thử chức năng trên tài khoản tổng hợp, không đánh giá năng lực của người dùng.

Trạng thái nghiệm thu được cập nhật tại [Phase 1 verification](CodeProve-Phase-1-Verification.md). Các test context ba lượt, attempt không tồn tại và mất mạng ở Phase 2/5 vẫn theo phase tương ứng; hai lượt hội thoại thành công không thay thế toàn bộ test matrix. Lần này chỉ bổ sung tài liệu/evidence, không sửa runtime code hoặc backend.
