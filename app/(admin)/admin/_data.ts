export type ExerciseStatus = "draft" | "review" | "approved" | "published";

export const statusTone: Record<ExerciseStatus, string> = {
  draft: "bg-surface-container-high text-on-surface-variant",
  review: "bg-warning/15 text-warning",
  approved: "bg-secondary/15 text-secondary",
  published: "bg-primary/15 text-primary",
};

export const formatDate = (value: string, locale: "vi" | "en" = "vi") => new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(`${value}T12:00:00+07:00`));
