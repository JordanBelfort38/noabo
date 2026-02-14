"use client";

import { useState } from "react";
import { KPICard } from "@/components/admin/KPICard";
import { TimeRangeSelector } from "@/components/admin/TimeRangeSelector";
import { SourcesPieChart } from "@/components/admin/charts/SourcesPieChart";
import { DataTable } from "@/components/admin/DataTable";
import { Globe, Share2, Link2, Mail } from "lucide-react";

// Demo data — replace with real analytics integration
const sourcesData = [
  { name: "Direct", value: 42, color: "#3B82F6" },
  { name: "Google (organique)", value: 28, color: "#10B981" },
  { name: "Réseaux sociaux", value: 18, color: "#F59E0B" },
  { name: "Referral", value: 8, color: "#8B5CF6" },
  { name: "Email", value: 4, color: "#EF4444" },
];

type ReferrerRow = {
  source: string;
  visitors: number;
  signups: number;
  conversionRate: string;
};

const referrers: ReferrerRow[] = [
  { source: "google.fr", visitors: 456, signups: 34, conversionRate: "7.5%" },
  { source: "reddit.com/r/france", visitors: 189, signups: 22, conversionRate: "11.6%" },
  { source: "twitter.com", visitors: 134, signups: 8, conversionRate: "6.0%" },
  { source: "facebook.com", visitors: 98, signups: 5, conversionRate: "5.1%" },
  { source: "linkedin.com", visitors: 67, signups: 4, conversionRate: "6.0%" },
  { source: "blog.noabo.fr", visitors: 45, signups: 12, conversionRate: "26.7%" },
  { source: "youtube.com", visitors: 34, signups: 2, conversionRate: "5.9%" },
];

const columns: {
  key: keyof ReferrerRow;
  label: string;
  sortable?: boolean;
  render?: (value: ReferrerRow[keyof ReferrerRow]) => React.ReactNode;
}[] = [
  {
    key: "source",
    label: "Source",
    sortable: true,
    render: (v) => <span className="font-mono text-xs">{String(v)}</span>,
  },
  { key: "visitors", label: "Visiteurs", sortable: true },
  { key: "signups", label: "Inscriptions", sortable: true },
  {
    key: "conversionRate",
    label: "Taux de conversion",
    sortable: true,
    render: (v) => {
      const n = parseFloat(String(v));
      return (
        <span
          className={
            n >= 10
              ? "font-semibold text-emerald-600"
              : n >= 5
                ? "text-amber-600"
                : "text-rose-600"
          }
        >
          {String(v)}
        </span>
      );
    },
  },
];

export default function AcquisitionPage() {
  const [range, setRange] = useState("30d");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Acquisition
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Sources de trafic et canaux d&apos;acquisition
          </p>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Trafic direct"
          value="42%"
          change={3.2}
          icon={<Globe className="h-5 w-5 text-blue-600" />}
          accentColor="blue"
        />
        <KPICard
          title="Recherche organique"
          value="28%"
          change={5.8}
          icon={<Link2 className="h-5 w-5 text-emerald-600" />}
          accentColor="emerald"
        />
        <KPICard
          title="Réseaux sociaux"
          value="18%"
          change={-1.2}
          icon={<Share2 className="h-5 w-5 text-amber-600" />}
          accentColor="amber"
        />
        <KPICard
          title="Email"
          value="4%"
          change={12.0}
          icon={<Mail className="h-5 w-5 text-rose-600" />}
          accentColor="rose"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Répartition des sources
          </h2>
          <SourcesPieChart data={sourcesData} />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Mots-clés organiques (top)
          </h2>
          <div className="space-y-3">
            {[
              { keyword: "résilier abonnement", clicks: 234, position: 3 },
              { keyword: "résiliation netflix", clicks: 189, position: 5 },
              { keyword: "gérer ses abonnements", clicks: 156, position: 4 },
              { keyword: "résilier free mobile", clicks: 98, position: 7 },
              { keyword: "lettre résiliation", clicks: 87, position: 6 },
              { keyword: "résiliation canal+", clicks: 76, position: 8 },
              { keyword: "loi hamon résiliation", clicks: 54, position: 12 },
            ].map((kw) => (
              <div
                key={kw.keyword}
                className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800"
              >
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {kw.keyword}
                </span>
                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{kw.clicks} clics</span>
                  <span className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono dark:bg-zinc-700">
                    #{kw.position}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={referrers} title="Top référents" exportable />
    </div>
  );
}
