export default function ItemsLoading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-20 rounded bg-line/60" />
        <div className="h-9 w-28 rounded-full bg-line/60" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-line">
            <div className="aspect-square bg-line/60" />
            <div className="space-y-2 p-3">
              <div className="h-3 w-3/4 rounded bg-line/60" />
              <div className="h-3 w-1/2 rounded bg-line/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
