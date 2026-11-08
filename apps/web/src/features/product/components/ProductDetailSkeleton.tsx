export function ProductDetailSkeleton() {
  return (
    <div role="status" aria-live="polite" className="px-4 pt-5">
      <span className="sr-only">Đang tải món</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="flex items-end gap-4">
          <div className="h-28 w-28 shrink-0 rounded-3xl bg-pine/10" />
          <div className="h-8 w-1/2 rounded bg-pine/10" />
        </div>
        <div className="mt-6 space-y-2">
          <div className="h-4 w-full rounded bg-pine/10" />
          <div className="h-4 w-3/4 rounded bg-pine/10" />
        </div>
        <div className="mt-8 space-y-2">
          <div className="h-[52px] rounded-xl bg-pine/10" />
          <div className="h-[52px] rounded-xl bg-pine/10" />
          <div className="h-[52px] rounded-xl bg-pine/10" />
        </div>
      </div>
    </div>
  );
}
