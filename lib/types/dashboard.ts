export type DashboardOut = {
  kpis: { completed: number; streak: number; avg_score: number };
  radar: { name: string; value: number }[];
  trend: number[];
  recent: { title: string; meta: string; status: string; score: number | null; ok: boolean }[];
};
