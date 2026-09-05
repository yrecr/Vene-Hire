/** Shared loading placeholder for dashboard pages gated on `isHydrated`/`loading`. */
export function PageLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading" role="status">
      <div className="h-8 w-48 bg-gray-100 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-100 rounded-2xl" />
    </div>
  );
}
