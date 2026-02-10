export default function TransactionsLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-64 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-zinc-100 px-5 py-4 last:border-b-0 dark:border-zinc-800"
            >
              <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
