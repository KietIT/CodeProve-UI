import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Activity, CalendarDays, CheckCircle2, Mail, Target } from "lucide-react";
import { formatDate, users } from "../../_data";
import { BackLink, card, PageHeading, PreviewNotice } from "../../_ui";

export const metadata: Metadata = { title: "Chi tiết người dùng", robots: { index: false } };

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const user = users.find((item) => String(item.id) === params.id);
  if (!user) notFound();
  const stats = [
    { label: "Lượt làm bài", value: user.attempts, icon: Activity },
    { label: "Đã hoàn thành", value: user.completed, icon: CheckCircle2 },
    { label: "Điểm trung bình", value: user.averageScore ?? "—", icon: Target },
  ];
  return <div><BackLink href="/admin/users?demo=1">Danh sách người dùng</BackLink><PageHeading eyebrow={`Tài khoản #${user.id}`} title={user.name} description="Thông tin và tiến độ của người dùng trong dữ liệu minh họa." /><PreviewNotice />
    <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]"><section className={`${card} p-6`}><div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary/15 text-2xl font-bold text-secondary">{user.name.charAt(0)}</span><div><h2 className="text-lg font-bold">{user.name}</h2><span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === "active" ? "bg-primary/15 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>{user.status === "active" ? "Hoạt động" : "Ít hoạt động"}</span></div></div><dl className="mt-7 space-y-4 text-sm"><div className="flex gap-3"><Mail size={17} className="shrink-0 text-on-surface-variant" /><div><dt className="text-on-surface-variant">Email</dt><dd className="font-medium">{user.email}</dd></div></div><div className="flex gap-3"><CalendarDays size={17} className="shrink-0 text-on-surface-variant" /><div><dt className="text-on-surface-variant">Ngày tham gia</dt><dd className="font-medium">{formatDate(user.joined)}</dd></div></div><div className="flex gap-3"><Activity size={17} className="shrink-0 text-on-surface-variant" /><div><dt className="text-on-surface-variant">Hoạt động gần nhất</dt><dd className="font-medium">{formatDate(user.lastActive)}</dd></div></div></dl></section>
      <section className={`${card} p-6`}><h2 className="text-lg font-bold">Tiến độ học tập</h2><p className="mt-1 text-sm text-on-surface-variant">Tóm tắt dựa trên lượt làm bài minh họa.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{stats.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl bg-surface-container-low p-4"><Icon size={19} className="text-primary" /><p className="mt-3 text-2xl font-bold tabular-nums">{value}</p><p className="mt-1 text-xs text-on-surface-variant">{label}</p></div>)}</div><div className="mt-6"><div className="flex justify-between text-xs"><span>Hoàn thành</span><span>{user.attempts ? Math.round(user.completed / user.attempts * 100) : 0}%</span></div><div className="mt-2 h-2 rounded-full bg-surface-container-high"><div className="h-2 rounded-full bg-primary" style={{ width: `${user.attempts ? user.completed / user.attempts * 100 : 0}%` }} /></div></div></section></div>
  </div>;
}
