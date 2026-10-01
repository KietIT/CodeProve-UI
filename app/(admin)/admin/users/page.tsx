"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { formatDate, users } from "../_data";
import { card, EmptyState, field, PageHeading, PreviewNotice, RowLink, secondaryButton } from "../_ui";

const pageSize = 5;

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => users.filter((user) => {
    const matchesSearch = `${user.name} ${user.email} ${user.id}`.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi"));
    return matchesSearch && (status === "all" || user.status === status);
  }), [search, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return <div><PageHeading eyebrow="Tài khoản" title="Người dùng" description="Tra cứu tài khoản và xem tiến độ học tập của từng người dùng." /><PreviewNotice />
    <div className={`${card} overflow-hidden`}><div className="flex flex-wrap items-end gap-3 border-b border-outline-variant/50 p-5"><label className="min-w-[230px] flex-1"><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Tìm kiếm</span><span className="relative block"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tên, email hoặc ID" className={`${field} pl-10`} /></span></label><label className="w-full sm:w-44"><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Trạng thái</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={field}><option value="all">Tất cả</option><option value="active">Hoạt động</option><option value="inactive">Ít hoạt động</option></select></label><div className="pb-2 text-xs text-on-surface-variant">{filtered.length} kết quả</div></div>
    {visible.length === 0 ? <EmptyState title="Không tìm thấy người dùng" description="Thử từ khóa hoặc bộ lọc khác." /> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-surface-container-low/80 text-xs uppercase tracking-wide text-on-surface-variant"><tr><th scope="col" className="px-5 py-3 font-semibold">Người dùng</th><th scope="col" className="px-5 py-3 font-semibold">Trạng thái</th><th scope="col" className="px-5 py-3 font-semibold">Tham gia</th><th scope="col" className="px-5 py-3 font-semibold">Hoàn thành</th><th scope="col" className="px-5 py-3 font-semibold">Điểm TB</th><th scope="col" className="px-5 py-3 font-semibold">Chi tiết</th></tr></thead><tbody className="divide-y divide-outline-variant/50">{visible.map((user) => <tr key={user.id} className="hover:bg-surface-container-low/60"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 font-bold text-secondary">{user.name.charAt(0)}</span><div><p className="font-semibold">{user.name}</p><p className="text-xs text-on-surface-variant">{user.email}</p></div></div></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === "active" ? "bg-primary/15 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>{user.status === "active" ? "Hoạt động" : "Ít hoạt động"}</span></td><td className="px-5 py-4 text-on-surface-variant">{formatDate(user.joined)}</td><td className="px-5 py-4 tabular-nums">{user.completed}/{user.attempts}</td><td className="px-5 py-4 tabular-nums">{user.averageScore ?? "—"}</td><td className="px-5 py-4"><RowLink href={`/admin/users/${user.id}?demo=1`}>Xem</RowLink></td></tr>)}</tbody></table></div>}
    <div className="flex items-center justify-between gap-3 border-t border-outline-variant/50 px-5 py-4"><p className="text-xs text-on-surface-variant">Trang {page}/{pages}</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={secondaryButton}>Trước</button><button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className={secondaryButton}>Sau</button></div></div></div>
    <p className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant"><Users size={14} /> Chức năng khóa, xóa hoặc đổi role sẽ cần API và chính sách phân quyền riêng.</p>
  </div>;
}
