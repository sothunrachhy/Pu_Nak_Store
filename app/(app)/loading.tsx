export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-40 rounded-2xl bg-line/60" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-2xl bg-line/60" />
        <div className="h-24 rounded-2xl bg-line/60" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-16 rounded-2xl bg-line/60" />
        <div className="h-16 rounded-2xl bg-line/60" />
      </div>
    </div>
  );
}
