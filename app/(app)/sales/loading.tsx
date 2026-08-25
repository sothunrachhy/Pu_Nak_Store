export default function SalesLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-16 rounded bg-line/60" />
        <div className="h-8 w-24 rounded-full bg-line/60" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-line">
            <div className="aspect-square bg-line/60" />
            <div className="space-y-1.5 p-2">
              <div className="h-2.5 w-full rounded bg-line/60" />
              <div className="h-2.5 w-1/2 rounded bg-line/60" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-16 rounded-2xl bg-line/60" />
      </div>
    </div>
  );
}
