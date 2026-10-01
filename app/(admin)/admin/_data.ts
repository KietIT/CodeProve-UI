export type AdminUser = {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  plan: "free" | "plus" | "pro";
  joined: string;
  lastActive: string;
  attempts: number;
  completed: number;
  averageScore: number | null;
};

export type ExerciseStatus = "draft" | "review" | "approved" | "published";

// User presentation fixtures only; exercise pages use the admin API.
export const users: AdminUser[] = [
  { id: 101, name: "Nguyễn Minh Anh", email: "minhanh@example.com", status: "active", plan: "plus", joined: "2026-09-03", lastActive: "2026-09-30", attempts: 18, completed: 12, averageScore: 82 },
  { id: 102, name: "Trần Quốc Bảo", email: "quocbao@example.com", status: "active", plan: "free", joined: "2026-09-05", lastActive: "2026-09-29", attempts: 11, completed: 7, averageScore: 74 },
  { id: 103, name: "Lê Hoàng Chi", email: "hoangchi@example.com", status: "active", plan: "pro", joined: "2026-09-08", lastActive: "2026-09-30", attempts: 24, completed: 19, averageScore: 89 },
  { id: 104, name: "Phạm Đức Duy", email: "ducduy@example.com", status: "inactive", plan: "free", joined: "2026-09-09", lastActive: "2026-09-18", attempts: 3, completed: 1, averageScore: 62 },
  { id: 105, name: "Võ Ngọc Hà", email: "ngocha@example.com", status: "active", plan: "plus", joined: "2026-09-12", lastActive: "2026-09-27", attempts: 9, completed: 6, averageScore: 77 },
  { id: 106, name: "Đỗ Gia Huy", email: "giahuy@example.com", status: "active", plan: "pro", joined: "2026-09-16", lastActive: "2026-09-30", attempts: 15, completed: 10, averageScore: 80 },
  { id: 107, name: "Bùi Khánh Linh", email: "khanhlinh@example.com", status: "inactive", plan: "free", joined: "2026-09-20", lastActive: "2026-09-21", attempts: 0, completed: 0, averageScore: null },
  { id: 108, name: "Mai Nhật Nam", email: "nhatnam@example.com", status: "active", plan: "free", joined: "2026-09-24", lastActive: "2026-09-30", attempts: 5, completed: 3, averageScore: 71 },
];

export const statusTone: Record<ExerciseStatus, string> = {
  draft: "bg-surface-container-high text-on-surface-variant",
  review: "bg-warning/15 text-warning",
  approved: "bg-secondary/15 text-secondary",
  published: "bg-primary/15 text-primary",
};

export const formatDate = (value: string, locale: "vi" | "en" = "vi") => new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(`${value}T12:00:00+07:00`));
