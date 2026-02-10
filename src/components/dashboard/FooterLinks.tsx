"use client";

import Link from "next/link";
import { BookOpen, HelpCircle, Lightbulb, Settings } from "lucide-react";

const links = [
  {
    icon: BookOpen,
    label: "Guide de résiliation",
    href: "/dashboard/cancellations",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: HelpCircle,
    label: "Aide & Export bancaire",
    href: "/help/export-bank-statement",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    icon: Lightbulb,
    label: "Conseils pour économiser",
    href: "/dashboard/subscriptions/new",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    icon: Settings,
    label: "Paramètres du compte",
    href: "/profile",
    color: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-100 dark:bg-zinc-800",
  },
];

export function FooterLinks() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition-all hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${link.bg}`}>
              <Icon className={`h-4 w-4 ${link.color}`} />
            </div>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {link.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
