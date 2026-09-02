export function DaySkeleton({ count = 4 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3.5">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex h-[92px] items-center justify-between rounded-2xl border border-line bg-surface px-4.5 md:px-7.5"
        >
          <span className="shimmer h-5 w-32 rounded-md" />
          <span className="shimmer h-4 w-20 rounded-md" />
        </div>
      ))}
    </div>
  )
}
