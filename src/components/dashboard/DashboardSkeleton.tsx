"use client";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome banner skeleton */}
        <div className="h-36 animate-pulse rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-800/50" />

        {/* Stats skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 border-t-4 border-t-zinc-300 bg-white p-5 dark:border-zinc-800 dark:border-t-zinc-700 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
              <div className="mt-3 h-8 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="mt-2 h-3 w-36 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ))}
        </div>

        {/* Quick actions skeleton */}
        <div>
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                <div className="mt-3 h-5 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="mt-2 h-3 w-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="mt-4 h-8 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Subscriptions skeleton */}
        <div>
          <div className="mb-4 h-6 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-l-4 border-zinc-200 border-l-zinc-300 bg-white p-4 dark:border-zinc-800 dark:border-l-zinc-700 dark:bg-zinc-900"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-3 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <div className="h-5 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
