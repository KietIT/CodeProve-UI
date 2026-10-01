import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, CheckCircle2, Clock3, Users } from "lucide-react";
import { exercises, formatDate, statusLabel, statusTone, users } from "./_data";
import { card, PageHeading, PreviewNotice, RowLink } from "./_ui";

export const metadata: Metadata = { title: "Tổng quan quản trị", robots: { index: false } };

const pending = exercises.filter((exercise) => exercise.status === "review");
const published = exercises.filter((exercise) => exercise.status === "published");
const totalAttempts = users.reduce((total, user) => total + user.attempts, 0);

export default function AdminDashboard() {
  const stats = [
    { title: "Người dùng", value: users.length, detail: `${users.filter((u) => u.status === "active").length} đang hoạt động`, icon: Users, href: "/admin/users?demo=1" },
    { title: "Bài tập", value: exercises.length, detail: `${published.length} đã xuất bản`, icon: BookOpen, href: "/admin/exercises?demo=1" },
    { title: "Lượt làm bài", value: totalAttempts, detail: "Trong dữ liệu mẫu", icon: CheckCircle2, href: "/admin/users?demo=1" },
    { title: "Chờ duyệt", value: pending.length, detail: "Cần xem nội dung", icon: Clock3, href: "/admin/exercises?demo=1" },
  ];
  return <div>
    <PageHeading eyebrow="Quản trị hệ thống" title="Tổng quan" description="Theo dõi người học, bài tập và nội dung đang chờ xử lý trong một nơi." />
    <PreviewNotice />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ title, value, detail, icon: Icon, href }) => <Link key={title} href={href} className={`${card} group p-5 transition-colors hover:border-primary/50`}><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={20} /></span><ArrowUpRight size={17} className="text-on-surface-variant transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div><p className="mt-5 text-sm text-on-surface-variant">{title}</p><p className="mt-1 text-3xl font-bold tabular-nums">{value}</p><p className="mt-2 text-xs text-on-surface-variant">{detail}</p></Link>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
      <section className={`${card} overflow-hidden`}><div className="flex items-center justify-between border-b border-outline-variant/50 p-5"><div><h2 className="text-lg font-bold">Bài tập chờ duyệt</h2><p className="mt-1 text-xs text-on-surface-variant">Kiểm tra nội dung trước khi xuất bản</p></div><RowLink href="/admin/exercises?demo=1">Xem tất cả</RowLink></div><div className="divide-y divide-outline-variant/50">{pending.map((exercise) => <div key={exercise.code} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold">{exercise.title}</p><p className="mt-1 text-xs text-on-surface-variant">{exercise.code} · {exercise.level} · cập nhật {formatDate(exercise.updatedAt)}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[exercise.status]}`}>{statusLabel[exercise.status]}</span><RowLink href={`/admin/exercises/${exercise.code}?demo=1`}>Xem</RowLink></div></div>)}</div></section>
      <section className={`${card} overflow-hidden`}><div className="flex items-center justify-between border-b border-outline-variant/50 p-5"><div><h2 className="text-lg font-bold">Người dùng gần đây</h2><p className="mt-1 text-xs text-on-surface-variant">Sắp theo ngày tham gia</p></div><RowLink href="/admin/users?demo=1">Xem tất cả</RowLink></div><div className="divide-y divide-outline-variant/50">{[...users].sort((a, b) => b.joined.localeCompare(a.joined)).slice(0, 4).map((user) => <div key={user.id} className="flex items-center justify-between gap-3 px-5 py-4"><div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 text-sm font-bold text-secondary">{user.name.charAt(0)}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-on-surface-variant">{user.email}</p></div></div><span className="shrink-0 text-xs text-on-surface-variant">{formatDate(user.joined)}</span></div>)}</div></section>
    </div>
    <div className={`${card} mt-6 flex flex-wrap items-center justify-between gap-3 p-5`}><div><h2 className="font-bold">Quy trình quản lý bài tập</h2><p className="mt-1 text-sm text-on-surface-variant">Bản nháp → kiểm tra → duyệt → xuất bản. Các bước xác thực và đồng bộ cần API backend.</p></div><Link href="/admin/exercises?demo=1" className="text-sm font-semibold text-primary hover:underline">Mở thư viện bài tập →</Link></div>
  </div>;
}
