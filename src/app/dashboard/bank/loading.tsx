import { BankCardSkeleton, BankStatsSkeleton } from "@/components/bank/BankCardSkeleton";

export default function BankLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-7 w-52 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-80 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
        <BankStatsSkeleton />
        <div>
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="grid gap-4 md:grid-cols-2">
            <BankCardSkeleton />
            <BankCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
