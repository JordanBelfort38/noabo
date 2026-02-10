"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, AlertTriangle, TrendingUp, Lightbulb, X } from "lucide-react";

interface AlertItem {
  type: "renewal" | "commitment_ending" | "price_increase" | "inactive";
  severity: "info" | "warning" | "urgent" | "tip";
  subscriptionId: string;
  merchantName: string;
  message: string;
  date: string | null;
  amount?: number;
}

interface AlertBannerProps {
  alerts: AlertItem[];
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  urgent: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
  },
  warning: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    icon: "text-orange-600 dark:text-orange-400",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
  },
  tip: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
  },
};

function getIcon(type: string, severity: string) {
  const className = `h-4 w-4 shrink-0 ${SEVERITY_STYLES[severity]?.icon ?? ""}`;
  switch (type) {
    case "renewal":
      return <Bell className={className} />;
    case "commitment_ending":
      return <AlertTriangle className={className} />;
    case "price_increase":
      return <TrendingUp className={className} />;
    case "inactive":
      return <Lightbulb className={className} />;
    default:
      return <Bell className={className} />;
  }
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (alerts.length === 0) return null;

  const visible = alerts.filter(
    (a) => !dismissed.has(`${a.type}-${a.subscriptionId}`)
  );

  if (visible.length === 0) return null;

  const dismiss = (alert: AlertItem) => {
    setDismissed((prev) => new Set(prev).add(`${alert.type}-${alert.subscriptionId}`));
  };

  return (
    <div className="space-y-2">
      {visible.slice(0, 5).map((alert, i) => {
        const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info;
        return (
          <div
            key={`${alert.type}-${alert.subscriptionId}-${i}`}
            className={`flex items-start gap-3 rounded-lg border p-3 ${style.bg} ${style.border}`}
          >
            {getIcon(alert.type, alert.severity)}
            <Link
              href={`/dashboard/subscriptions/${alert.subscriptionId}`}
              className="min-w-0 flex-1 text-sm text-zinc-700 hover:underline dark:text-zinc-300"
            >
              {alert.message}
            </Link>
            <button
              onClick={() => dismiss(alert)}
              className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
      {visible.length > 5 && (
        <p className="text-center text-xs text-zinc-500">
          +{visible.length - 5} autre(s) alerte(s)
        </p>
      )}
    </div>
  );
}
