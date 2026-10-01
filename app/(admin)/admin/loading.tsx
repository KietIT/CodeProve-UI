export default function AdminLoading() {
  return <div role="status" className="space-y-5 animate-pulse"><div className="h-8 w-52 rounded-lg bg-surface-container-high" /><div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-32 rounded-2xl bg-surface-container-low" />)}</div><div className="h-80 rounded-2xl bg-surface-container-low" /><span className="sr-only">Đang tải trang quản trị</span></div>;
}
