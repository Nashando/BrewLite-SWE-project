export function MenuSkeleton() {
  return (
    <div role="status" aria-live="polite" className="divide-y divide-line">
      <span className="sr-only">Đang tải menu</span>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} aria-hidden="true" className="flex gap-4 py-4 motion-safe:animate-pulse">
          <div className="h-[72px] w-[72px] shrink-0 rounded-2xl bg-pine/10" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 w-2/3 rounded bg-pine/10" />
            <div className="h-3 w-full rounded bg-pine/10" />
            <div className="h-3 w-4/5 rounded bg-pine/10" />
          </div>
          <div className="h-4 w-16 rounded bg-pine/10" />
        </div>
      ))}
    </div>
  );
}
