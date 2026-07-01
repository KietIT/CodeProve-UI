// Vietnamese overlay for exercise briefings (problem statement + hint).
// The canonical exercise data in `lib/exercises.ts` stays English; when the
// locale is "vi" the solve workspace looks the content up here by exercise code
// and falls back to English if a code is missing. Technical terms are kept in
// English on purpose (hash map, deadlock, JWT, Redis…).

export type ExerciseCopy = { summary: string; hint: string };

export const exerciseContentVi: Record<string, ExerciseCopy> = {
  "CP-001": {
    summary:
      "Cho một mảng số nguyên và một giá trị target, trả về chỉ số của hai số cộng lại bằng target. Giải thích hướng tiếp cận của bạn trước và sau khi viết code.",
    hint: "Trước khi code — giả thuyết của bạn để đạt O(n) là gì? Một hash map cho phép kiểm tra phần bù trong thời gian hằng số.",
  },
  "CP-002": {
    summary:
      "Đảo ngược một danh sách liên kết đơn tại chỗ và trả về head mới. Hãy phân tích cách gán lại con trỏ trước khi code.",
    hint: "Bạn có thể đảo ngược mà không dùng thêm bộ nhớ không? Theo dõi ba con trỏ: prev, current và next.",
  },
  "CP-003": {
    summary:
      "Trả về True nếu chuỗi là palindrome, bỏ qua hoa/thường và ký tự không phải chữ-số. Hãy nêu kế hoạch hai con trỏ trước.",
    hint: "Hai con trỏ từ hai đầu giúp tránh tạo danh sách thứ hai. Bạn nên bỏ qua những ký tự nào?",
  },
  "CP-004": {
    summary:
      "Hàm cần tính tổng n số nguyên đầu tiên nhưng trả về kết quả sai. Hãy tìm lỗi off-by-one và sửa nó.",
    hint: "Chạy tay vòng lặp với n = 3. Giá trị nào không bao giờ được cộng vào tổng?",
  },
  "CP-005": {
    summary:
      "Loại bỏ các ký tự nguy hiểm khỏi username trước khi nó đến tầng cơ sở dữ liệu. Giải thích bạn đang phòng chống điều gì.",
    hint: "Bạn đang ngăn loại injection nào ở đây? Ưu tiên danh sách cho phép (allow-list) hơn danh sách chặn (block-list).",
  },
  "CP-006": {
    summary:
      "Trả về một dict ánh xạ mỗi từ tới số lần xuất hiện, không phân biệt hoa/thường. Sau đó giải thích collections.Counter làm gì bên trong.",
    hint: "Đã có collections.Counter — nhưng bạn có giải thích được mẫu tích luỹ bằng dict mà nó thay thế không?",
  },
  "CP-007": {
    summary:
      "Trộn hai mảng tăng dần thành một mảng đã sắp xếp mà không gọi hàm sort có sẵn. Hãy biện luận độ phức tạp.",
    hint: "Hai con trỏ giữ độ phức tạp O(n + m). Vì sao gọi sort() trên mảng nối lại là đáp án tệ hơn?",
  },
  "CP-008": {
    summary:
      "Hàm này bị lỗi khi người dùng không có profile. Hãy tìm chỗ truy cập null và phòng vệ an toàn.",
    hint: "Khoá nào không chắc chắn tồn tại? Hãy dùng .get() hoặc return sớm.",
  },
  "CP-009": {
    summary:
      "Cho phép tối đa N request mỗi client mỗi phút. Thảo luận đánh đổi giữa cửa sổ cố định và cửa sổ trượt.",
    hint: "Điều gì xảy ra ngay tại ranh giới cửa sổ? Cân nhắc sliding log hoặc token bucket.",
  },
  "CP-010": {
    summary:
      "Trả về Fizz, Buzz, hoặc FizzBuzz cho 1..n. Sau đó giải thích vì sao thứ tự các điều kiện lại quan trọng.",
    hint: "Vì sao kiểm tra % 15 phải đứng trước? Thử đổi thứ tự và dự đoán điều gì sẽ hỏng.",
  },
  "CP-011": {
    summary:
      "Một mảng n+1 số nguyên trong khoảng 1..n chứa đúng một giá trị lặp. Hãy tìm nó và thảo luận đánh đổi về bộ nhớ.",
    hint: "Cách dùng set tốn O(n) bộ nhớ. Liệu thuật toán phát hiện chu trình Floyd có đưa bạn về O(1) không?",
  },
  "CP-012": {
    summary:
      "Hai luồng cùng tăng một biến đếm chung và tổng bị sai. Hãy xác định race condition và làm cho nó an toàn.",
    hint: "Vì sao += không phải thao tác nguyên tử giữa các luồng? Một lock hoặc primitive nguyên tử sẽ khắc phục.",
  },
  "CP-101": {
    summary:
      "Hiện thực một LRU cache với get và put O(1). Mô tả lựa chọn cấu trúc dữ liệu trước khi viết code.",
    hint: "Vì sao ghép hash map với danh sách liên kết đôi? move_to_end tốn chi phí gì?",
  },
  "CP-102": {
    summary:
      "Một cache phình to không giới hạn khi chạy thật. Tìm lý do các mục không bao giờ được giải phóng và sửa nó.",
    hint: "Một dict không giới hạn chính là chỗ rò rỉ. Thêm kích thước tối đa hoặc dùng functools.lru_cache.",
  },
  "CP-103": {
    summary:
      "Xác minh chữ ký và hạn dùng của JWT trước khi tin bất kỳ claim nào. Ghi rõ điều gì tuyệt đối không được bỏ qua.",
    hint: "Vì sao phải cố định thuật toán một cách tường minh? Chấp nhận 'alg: none' mở ra kiểu tấn công nào?",
  },
  "CP-104": {
    summary:
      "Phối hợp producer và consumer trên một hàng đợi có giới hạn mà không busy-wait.",
    hint: "Một hàng đợi chặn (blocking queue) thay thế vòng while-True polling như thế nào? Điều gì báo hiệu công việc đã xong?",
  },
  "CP-105": {
    summary:
      "Trả về độ dài chuỗi con dài nhất không có ký tự lặp. Giải thích bất biến của cửa sổ (window invariant).",
    hint: "Cửa sổ trượt cùng map 'lần thấy cuối' giữ độ phức tạp O(n). Chính xác thì khi nào bạn dịch 'start'?",
  },
  "CP-106": {
    summary:
      "Truy vấn này nối trực tiếp dữ liệu người dùng. Hãy viết lại cho an toàn trước injection và giải thích cách sửa.",
    hint: "Truy vấn tham số hoá tách code khỏi dữ liệu. Vì sao chỉ escape thủ công là chưa đủ?",
  },
  "CP-107": {
    summary:
      "Trả về True nếu đồ thị có hướng chứa chu trình. Chọn và biện luận chiến lược duyệt.",
    hint: "Vì sao cần ba trạng thái, không chỉ đã-thăm/chưa-thăm? Cạnh lùi (back edge) là gì?",
  },
  "CP-108": {
    summary:
      "Xây dựng một biến đếm vẫn đúng khi bị tăng đồng thời với cường độ cao.",
    hint: "Lock cần được giữ chính xác ở đâu? Giữ vùng tới hạn (critical section) nhỏ nhất có thể.",
  },
  "CP-109": {
    summary:
      "Một ngoại lệ bị nuốt và ném lại mà mất ngữ cảnh. Hãy khôi phục một stack trace hữu ích, có liên kết nguyên nhân.",
    hint: "'raise ... from e' giữ lại điều gì mà một lần re-raise trơ trọi đã vứt bỏ?",
  },
  "CP-110": {
    summary:
      "Trả về giá trị lớn nhất của mỗi cửa sổ kích thước k. Hướng tới O(n) tổng thể.",
    hint: "Vì sao dùng deque đơn điệu chứa chỉ số thay vì tính lại max cho mỗi cửa sổ?",
  },
  "CP-201": {
    summary:
      "Thiết kế một bộ giới hạn tốc độ hoạt động xuyên nhiều app server. Thảo luận đánh đổi giữa tính nhất quán và độ trễ.",
    hint: "Vì sao tập trung trạng thái trong Redis? Có race condition nào giữa INCR và EXPIRE, và bạn khắc phục thế nào?",
  },
  "CP-202": {
    summary:
      "Tìm trung vị của hai mảng đã sắp xếp trong O(log(m+n)). Giải thích bất biến phân hoạch trước khi code.",
    hint: "Mẹo là tìm kiếm nhị phân trên điểm phân hoạch, không phải trộn mảng. Bất biến nào định nghĩa một lát cắt đúng?",
  },
  "CP-203": {
    summary:
      "Một middleware cho lọt vài request chưa xác thực. Hãy tìm lỗ hổng logic và bịt lại.",
    hint: "Có token không có nghĩa là token hợp lệ. Bạn phải xác minh gì trước khi gọi handler?",
  },
  "CP-204": {
    summary:
      "Hiện thực một ring buffer một-producer một-consumer mà không dùng lock.",
    hint: "Với một producer và một consumer, mỗi bên sở hữu độc quyền chỉ số nào?",
  },
  "CP-205": {
    summary:
      "Hiện thực so khớp '.' và '*' với một chuỗi đầu vào. Giải thích định nghĩa trạng thái quy hoạch động của bạn.",
    hint: "Các chỉ số (i, j) đại diện cho điều gì? Xử lý '*' như không-hoặc-nhiều lần của ký tự đứng trước.",
  },
  "CP-206": {
    summary:
      "Hai luồng mỗi luồng giữ một lock và chờ lock kia. Hãy phá deadlock mà không mất an toàn.",
    hint: "Thứ tự khoá nhất quán ngăn được chu trình. Làm sao sắp thứ tự hai tài khoản bất kỳ một cách tất định?",
  },
  "CP-207": {
    summary:
      "Tuần tự hoá một cây nhị phân thành chuỗi rồi giải tuần tự lại, giữ đúng cấu trúc.",
    hint: "Vì sao các dấu null giúp riêng một lần duyệt preorder tái tạo cây không nhập nhằng?",
  },
  "CP-208": {
    summary:
      "Một handler upload tin tưởng tên file và content-type từ client. Liệt kê các rủi ro và sửa chúng.",
    hint: "Path traversal, giả mạo kiểu file, giới hạn dung lượng — bạn bịt rủi ro nào trước, và vì sao?",
  },
};
