export type DashboardOut = {
  kpis: { completed: number; streak: number; avg_score: number };
  /** `value` is null when the axis was never observed across the user's reports. */
  radar: { name: string; value: number | null }[];
  trend: number[];
  recent: { title: string; meta: string; status: string; score: number | null; ok: boolean }[];
};
