export default function CancellationsLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-44 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-72 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3 w-48 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
