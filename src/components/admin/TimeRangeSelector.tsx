"use client";

import { Calendar } from "lucide-react";

const presets = [
  { label: "7 derniers jours", value: "7d" },
  { label: "30 derniers jours", value: "30d" },
  { label: "90 derniers jours", value: "90d" },
  { label: "12 derniers mois", value: "12m" },
];

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-5 w-5 text-zinc-400" />
      <div className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              value === preset.value
                ? "bg-blue-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
