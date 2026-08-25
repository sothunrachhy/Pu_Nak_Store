export default function ExpensesLoading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 rounded bg-line/60" />
        <div className="h-9 w-32 rounded-full bg-line/60" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl border border-line bg-line/40" />
        ))}
      </div>
    </div>
  );
}
