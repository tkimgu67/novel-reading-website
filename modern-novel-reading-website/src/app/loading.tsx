export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
      <div className="skeleton mb-4 h-10 w-72 rounded-xl" />
      <div className="skeleton mb-10 h-5 w-96 max-w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-white/5 bg-coal">
            <div className="skeleton aspect-[3/4]" />
            <div className="space-y-3 p-5">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
