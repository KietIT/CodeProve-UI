export type AdminUser = {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  joined: string;
  lastActive: string;
  attempts: number;
  completed: number;
  averageScore: number | null;
};

export type ExerciseStatus = "draft" | "review" | "approved" | "published";
export type ExerciseKind = "implement" | "debug";
export type ExerciseLevel = "fresher" | "junior" | "senior";
export type ExerciseDifficulty = "Easy" | "Medium" | "Hard";
export type AdminTest = { description: string; input: string; expected: string; category: "happy" | "boundary" | "edge" | "error"; hidden: boolean };
export type AdminMutant = { code: string; bugLine: number; bugType: string; noteVi: string; noteEn: string };
export type AdminExercise = {
  code: string;
  title: string;
  level: ExerciseLevel;
  kind: ExerciseKind;
  difficulty: ExerciseDifficulty;
  status: ExerciseStatus;
  summary: string;
  starterCode: string;
  hint: string;
  referenceSolution: string;
  skills: string[];
  tests: AdminTest[];
  mutants: AdminMutant[];
  updatedAt: string;
};

// Presentation fixtures only. No endpoint in the current backend returns admin data.
export const users: AdminUser[] = [
  { id: 101, name: "Nguyễn Minh Anh", email: "minhanh@example.com", status: "active", joined: "2026-09-03", lastActive: "2026-09-30", attempts: 18, completed: 12, averageScore: 82 },
  { id: 102, name: "Trần Quốc Bảo", email: "quocbao@example.com", status: "active", joined: "2026-09-05", lastActive: "2026-09-29", attempts: 11, completed: 7, averageScore: 74 },
  { id: 103, name: "Lê Hoàng Chi", email: "hoangchi@example.com", status: "active", joined: "2026-09-08", lastActive: "2026-09-30", attempts: 24, completed: 19, averageScore: 89 },
  { id: 104, name: "Phạm Đức Duy", email: "ducduy@example.com", status: "inactive", joined: "2026-09-09", lastActive: "2026-09-18", attempts: 3, completed: 1, averageScore: 62 },
  { id: 105, name: "Võ Ngọc Hà", email: "ngocha@example.com", status: "active", joined: "2026-09-12", lastActive: "2026-09-27", attempts: 9, completed: 6, averageScore: 77 },
  { id: 106, name: "Đỗ Gia Huy", email: "giahuy@example.com", status: "active", joined: "2026-09-16", lastActive: "2026-09-30", attempts: 15, completed: 10, averageScore: 80 },
  { id: 107, name: "Bùi Khánh Linh", email: "khanhlinh@example.com", status: "inactive", joined: "2026-09-20", lastActive: "2026-09-21", attempts: 0, completed: 0, averageScore: null },
  { id: 108, name: "Mai Nhật Nam", email: "nhatnam@example.com", status: "active", joined: "2026-09-24", lastActive: "2026-09-30", attempts: 5, completed: 3, averageScore: 71 },
];

const starter = "def sum_to_n(n):\n    # TODO: implement\n    pass";
const reference = "def sum_to_n(n):\n    return sum(range(n + 1))";
const sampleTests: AdminTest[] = [
  { description: "Tổng từ 1 đến 3", input: "sum_to_n(3)", expected: "6", category: "happy", hidden: false },
  { description: "Đầu vào bằng 0", input: "sum_to_n(0)", expected: "0", category: "boundary", hidden: true },
];
const sampleMutants: AdminMutant[] = [
  { code: "def sum_to_n(n):\n    return sum(range(n))", bugLine: 2, bugType: "off-by-one", noteVi: "Vòng lặp bỏ sót n.", noteEn: "The loop skips n." },
];

export const exercises: AdminExercise[] = [
  { code: "CP-001", title: "Tính tổng từ 1 đến n", level: "fresher", kind: "implement", difficulty: "Easy", status: "published", summary: "Viết hàm trả về tổng các số nguyên từ 1 đến n.", starterCode: starter, hint: "Xét trường hợp n bằng 0.", referenceSolution: reference, skills: ["loops", "boundary-cases"], tests: sampleTests, mutants: sampleMutants, updatedAt: "2026-09-29" },
  { code: "CP-004", title: "Tìm phần tử lớn nhất", level: "fresher", kind: "implement", difficulty: "Easy", status: "review", summary: "Tìm giá trị lớn nhất trong danh sách không rỗng.", starterCode: "def find_max(values):\n    pass", hint: "Duyệt từng phần tử.", referenceSolution: "def find_max(values):\n    return max(values)", skills: ["arrays"], tests: sampleTests, mutants: sampleMutants, updatedAt: "2026-09-30" },
  { code: "CP-008", title: "Kiểm tra chuỗi đối xứng", level: "fresher", kind: "debug", difficulty: "Medium", status: "draft", summary: "Sửa lỗi trong hàm kiểm tra palindrome.", starterCode: "def is_palindrome(text):\n    return text == text.reverse()", hint: "Kiểm tra cách đảo chuỗi.", referenceSolution: "def is_palindrome(text):\n    return text == text[::-1]", skills: ["strings", "debugging"], tests: sampleTests, mutants: sampleMutants, updatedAt: "2026-09-27" },
  { code: "CP-101", title: "Hai tổng", level: "junior", kind: "implement", difficulty: "Medium", status: "published", summary: "Tìm hai chỉ số có tổng bằng mục tiêu.", starterCode: "def two_sum(nums, target):\n    pass", hint: "Lưu những giá trị đã gặp.", referenceSolution: "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i", skills: ["hash-map"], tests: sampleTests, mutants: sampleMutants, updatedAt: "2026-09-24" },
  { code: "CP-105", title: "Gộp khoảng", level: "junior", kind: "implement", difficulty: "Medium", status: "approved", summary: "Gộp các khoảng giao nhau.", starterCode: "def merge_intervals(intervals):\n    pass", hint: "Sắp xếp trước khi duyệt.", referenceSolution: "def merge_intervals(intervals):\n    return intervals", skills: ["sorting"], tests: sampleTests, mutants: sampleMutants, updatedAt: "2026-09-28" },
  { code: "CP-201", title: "Bộ nhớ đệm LRU", level: "senior", kind: "debug", difficulty: "Hard", status: "review", summary: "Tìm và sửa lỗi trong bộ nhớ đệm LRU.", starterCode: "class LRUCache:\n    pass", hint: "Kiểm tra thứ tự truy cập.", referenceSolution: "class LRUCache:\n    pass", skills: ["data-structures", "debugging"], tests: sampleTests, mutants: sampleMutants, updatedAt: "2026-09-30" },
];

export const statusLabel: Record<ExerciseStatus, string> = { draft: "Bản nháp", review: "Chờ duyệt", approved: "Đã duyệt", published: "Đã xuất bản" };
export const statusTone: Record<ExerciseStatus, string> = {
  draft: "bg-surface-container-high text-on-surface-variant",
  review: "bg-warning/15 text-warning",
  approved: "bg-secondary/15 text-secondary",
  published: "bg-primary/15 text-primary",
};

export const formatDate = (value: string) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(`${value}T12:00:00+07:00`));
