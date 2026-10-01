import Link from "next/link";

export default function AdminNotFound() {
  return <div className="mx-auto max-w-lg py-20 text-center"><p className="text-sm font-bold uppercase tracking-widest text-primary">404</p><h1 className="mt-3 text-3xl font-bold">Không tìm thấy trang</h1><p className="mt-2 text-sm text-on-surface-variant">Đường dẫn quản trị này không tồn tại hoặc đã thay đổi.</p><Link href="/admin?demo=1" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary">Về tổng quan</Link></div>;
}
