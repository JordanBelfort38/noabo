"use client";

import { Card, CardContent } from "@/components/ui/card";

export function BankCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-5 w-14 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>
            <div className="flex gap-4">
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-4 w-16 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="h-8 w-8 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-8 w-8 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-8 w-8 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BankStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          <div className="space-y-1.5">
            <div className="h-5 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
