export default function BankConnectLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-72 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
          <div className="mt-6 h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
