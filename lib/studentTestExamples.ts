// Static facts about the exercises with the Tests tab (P2.3), taken from the
// backend content files. Only VISIBLE tests are used here: hidden tests stay
// on the server. The API does not expose test inputs, so the fresher worked
// example lives on this side.
import type { StudentTest, StudentTestCategory } from "@/lib/types/attempt";

export type WorkedExample = Omit<StudentTest, "why"> & { why: { vi: string; en: string } };

export type ExerciseTestFacts = {
  /** Categories the exercise's own tests cover (what category coverage is measured against). */
  categories: StudentTestCategory[];
  /** Fresher learning mode: one worked example built from a visible test. */
  example?: WorkedExample;
};

const MAIN: StudentTestCategory[] = ["happy", "boundary", "edge"];

export const EXERCISE_TEST_FACTS: Readonly<Record<string, ExerciseTestFacts>> = {
  "CP-001": {
    categories: MAIN,
    example: {
      category: "happy",
      input: "two_sum([2, 7, 11, 15], 9)",
      expected: "[0, 1]",
      why: { vi: "Trường hợp điển hình: 2 + 7 = 9, nằm ở vị trí 0 và 1.", en: "Typical case: 2 + 7 = 9, at positions 0 and 1." },
    },
  },
  "CP-003": {
    categories: MAIN,
    example: {
      category: "happy",
      input: "is_palindrome('racecar')",
      expected: "True",
      why: { vi: "Một từ đọc xuôi hay ngược đều giống nhau.", en: "A word that reads the same both ways." },
    },
  },
  "CP-004": {
    categories: MAIN,
    example: {
      category: "happy",
      input: "sum_to_n(3)",
      expected: "6",
      why: { vi: "1 + 2 + 3 = 6: phải cộng cả chính n.", en: "1 + 2 + 3 = 6: n itself must be added." },
    },
  },
  "CP-005": {
    categories: MAIN,
    example: {
      category: "happy",
      input: "sanitize_username('alice!@#')",
      expected: "'alice'",
      why: { vi: "Ký tự đặc biệt bị bỏ, chữ cái được giữ.", en: "Special characters go, letters stay." },
    },
  },
  "CP-006": {
    categories: MAIN,
    example: {
      category: "happy",
      input: "dict(word_count('hello world'))",
      expected: "{'hello': 1, 'world': 1}",
      why: { vi: "Hai từ khác nhau, mỗi từ xuất hiện một lần.", en: "Two different words, once each." },
    },
  },
  "CP-007": {
    categories: MAIN,
    example: {
      category: "happy",
      input: "merge([1, 3, 5], [2, 4, 6])",
      expected: "[1, 2, 3, 4, 5, 6]",
      why: { vi: "Hai mảng xen kẽ phải được trộn đúng thứ tự.", en: "Interleaved arrays must merge in order." },
    },
  },
  "CP-008": {
    categories: MAIN,
    example: {
      category: "happy",
      input: "display_name({'profile': {'name': 'Alice'}})",
      expected: "'Alice'",
      why: { vi: "Có đủ profile và name thì trả về tên.", en: "Profile and name present: return the name." },
    },
  },
  "CP-009": {
    categories: MAIN,
    example: {
      category: "happy",
      input: "is_allowed('user1', {}, limit=60)",
      expected: "True",
      why: { vi: "Người dùng chưa gửi request nào thì được phép.", en: "A user with no requests yet is allowed." },
    },
  },
  "CP-010": {
    categories: MAIN,
    example: {
      category: "happy",
      input: "fizzbuzz(5)",
      expected: "['1', '2', 'Fizz', '4', 'Buzz']",
      why: { vi: "Năm số đầu đã có cả Fizz và Buzz.", en: "The first five numbers include Fizz and Buzz." },
    },
  },
  "CP-011": {
    categories: MAIN,
    example: {
      category: "happy",
      input: "find_duplicate([1, 3, 4, 2, 2])",
      expected: "2",
      why: { vi: "Số 2 xuất hiện hai lần.", en: "2 appears twice." },
    },
  },
  "CP-101": { categories: MAIN },
  "CP-102": { categories: MAIN },
  "CP-104": { categories: MAIN },
  "CP-105": { categories: MAIN },
  "CP-107": { categories: MAIN },
  "CP-108": { categories: MAIN },
  "CP-110": { categories: MAIN },
  "CP-202": { categories: MAIN },
  "CP-204": { categories: MAIN },
  "CP-205": { categories: MAIN },
};
