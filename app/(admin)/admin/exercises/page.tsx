"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { exercises, formatDate, statusLabel, statusTone } from "../_data";
import { card, EmptyState, field, PageHeading, PreviewNotice, RowLink, secondaryButton } from "../_ui";

const pageSize = 5;

export default function AdminExercisesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [level, setLevel] = useState("all");
  const [kind, setKind] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => exercises.filter((exercise) =>
    `${exercise.code} ${exercise.title}`.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")) &&
    (status === "all" || exercise.status === status) &&
    (level === "all" || exercise.level === level) &&
    (kind === "all" || exercise.kind === kind)
  ), [search, status, level, kind]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return <div><PageHeading eyebrow="Nội dung học tập" title="Bài tập" description="Theo dõi trạng thái nội dung, xem test case và chuẩn bị bản sửa cho quy trình duyệt." /><PreviewNotice />
    <div className={`${card} overflow-hidden`}><div className="grid gap-3 border-b border-outline-variant/50 p-5 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_repeat(3,160px)]"><label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Tìm bài tập</span><span className="relative block"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Mã hoặc tiêu đề" className={`${field} pl-10`} /></span></label><label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Trạng thái</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={field}><option value="all">Tất cả</option><option value="draft">Bản nháp</option><option value="review">Chờ duyệt</option><option value="approved">Đã duyệt</option><option value="published">Đã xuất bản</option></select></label><label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Cấp độ</span><select value={level} onChange={(event) => { setLevel(event.target.value); setPage(1); }} className={field}><option value="all">Tất cả</option><option value="fresher">Fresher</option><option value="junior">Junior</option><option value="senior">Senior</option></select></label><label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Loại bài</span><select value={kind} onChange={(event) => { setKind(event.target.value); setPage(1); }} className={field}><option value="all">Tất cả</option><option value="implement">Implement</option><option value="debug">Debug</option></select></label></div>
    {visible.length === 0 ? <EmptyState title="Không tìm thấy bài tập" description="Thử thay đổi bộ lọc hoặc từ khóa." /> : <div className="overflow-x-auto"><table className="w-full min-w-[810px] text-left text-sm"><thead className="bg-surface-container-low/80 text-xs uppercase tracking-wide text-on-surface-variant"><tr><th scope="col" className="px-5 py-3 font-semibold">Bài tập</th><th scope="col" className="px-5 py-3 font-semibold">Cấp độ</th><th scope="col" className="px-5 py-3 font-semibold">Loại</th><th scope="col" className="px-5 py-3 font-semibold">Trạng thái</th><th scope="col" className="px-5 py-3 font-semibold">Cập nhật</th><th scope="col" className="px-5 py-3 font-semibold">Chi tiết</th></tr></thead><tbody className="divide-y divide-outline-variant/50">{visible.map((exercise) => <tr key={exercise.code} className="hover:bg-surface-container-low/60"><td className="px-5 py-4"><p className="font-semibold">{exercise.title}</p><p className="mt-0.5 text-xs text-on-surface-variant">{exercise.code} · {exercise.difficulty}</p></td><td className="px-5 py-4 capitalize">{exercise.level}</td><td className="px-5 py-4 capitalize">{exercise.kind}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[exercise.status]}`}>{statusLabel[exercise.status]}</span></td><td className="px-5 py-4 text-on-surface-variant">{formatDate(exercise.updatedAt)}</td><td className="px-5 py-4"><RowLink href={`/admin/exercises/${exercise.code}?demo=1`}>Biên tập</RowLink></td></tr>)}</tbody></table></div>}
    <div className="flex items-center justify-between gap-3 border-t border-outline-variant/50 px-5 py-4"><p className="text-xs text-on-surface-variant">{filtered.length} kết quả · Trang {page}/{pages}</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={secondaryButton}>Trước</button><button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className={secondaryButton}>Sau</button></div></div></div>
  </div>;
}
