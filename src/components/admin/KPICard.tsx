"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import type { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  accentColor?: string;
}

export function KPICard({
  title,
  value,
  change,
  icon,
  accentColor = "blue",
}: KPICardProps) {
  const colorMap: Record<string, { iconBg: string; border: string }> = {
    blue: {
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-t-blue-500",
    },
    emerald: {
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-t-emerald-500",
    },
    orange: {
      iconBg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-t-orange-500",
    },
    violet: {
      iconBg: "bg-violet-50 dark:bg-violet-900/20",
      border: "border-t-violet-500",
    },
    rose: {
      iconBg: "bg-rose-50 dark:bg-rose-900/20",
      border: "border-t-rose-500",
    },
    amber: {
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-t-amber-500",
    },
  };

  const colors = colorMap[accentColor] ?? colorMap.blue;

  return (
    <div
      className={`rounded-xl border border-zinc-200 border-t-4 ${colors.border} bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900`}
    >
      <div className="flex items-center justify-between">
        {icon && (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.iconBg}`}
          >
            {icon}
          </div>
        )}
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              change >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {change >= 0 ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>

      <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}
