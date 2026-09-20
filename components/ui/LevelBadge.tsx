import { Badge, type BadgeProps, type BadgeTone } from "./Badge";

export type Level = "Easy" | "Medium" | "Hard" | "green" | "yellow" | "red";
export type LevelBadgeProps = Omit<BadgeProps, "tone" | "children"> & { level: Level; label?: string };
const levels: Record<Level, { tone: BadgeTone; label: string }> = {
  Easy: { tone: "success", label: "Easy" }, Medium: { tone: "warning", label: "Medium" }, Hard: { tone: "danger", label: "Hard" },
  green: { tone: "success", label: "No flags" }, yellow: { tone: "warning", label: "Review" }, red: { tone: "danger", label: "Flagged" },
};
export function LevelBadge({ level, label, ...props }: LevelBadgeProps) {
  const style = levels[level];
  return <Badge {...props} tone={style.tone}><span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />{label ?? style.label}</Badge>;
}
