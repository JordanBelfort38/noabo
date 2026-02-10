"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SpendingChartProps {
  data: { month: string; amount: number }[];
}

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function SpendingChart({ data }: SpendingChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
        Pas assez de données pour afficher le graphique
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#71717a" }}
          axisLine={{ stroke: "#e4e4e7" }}
        />
        <YAxis
          tickFormatter={(v: number) => formatEuros(v)}
          tick={{ fontSize: 12, fill: "#71717a" }}
          axisLine={{ stroke: "#e4e4e7" }}
          width={70}
        />
        <Tooltip
          formatter={(value: number | undefined) => [formatEuros(value ?? 0), "Dépenses"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e4e4e7",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ fill: "#3B82F6", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
