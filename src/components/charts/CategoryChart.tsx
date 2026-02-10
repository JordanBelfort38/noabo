"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CategoryData {
  name: string;
  count: number;
  monthlyCost: number;
}

interface CategoryChartProps {
  data: Record<string, { count: number; monthlyCost: number }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  subscription: "Abonnement",
  streaming: "Streaming",
  software: "Logiciel",
  telecom: "Télécom",
  housing: "Logement",
  insurance: "Assurance",
  health: "Santé",
  transport: "Transport",
  entertainment: "Divertissement",
  shopping: "Shopping",
  groceries: "Alimentation",
  restaurant: "Restaurant",
  other: "Autre",
};

const CATEGORY_COLORS: Record<string, string> = {
  subscription: "#EF4444",
  streaming: "#EF4444",
  software: "#3B82F6",
  telecom: "#6366F1",
  housing: "#10B981",
  insurance: "#8B5CF6",
  health: "#EC4899",
  transport: "#06B6D4",
  entertainment: "#F97316",
  shopping: "#14B8A6",
  groceries: "#10B981",
  restaurant: "#F59E0B",
  other: "#71717A",
};

function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData: CategoryData[] = Object.entries(data).map(
    ([key, value]) => ({
      name: CATEGORY_LABELS[key] ?? key,
      count: value.count,
      monthlyCost: value.monthlyCost,
    })
  );

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
        Pas de données par catégorie
      </div>
    );
  }

  const colors = Object.keys(data).map(
    (key) => CATEGORY_COLORS[key] ?? "#71717A"
  );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="monthlyCost"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          label={({ name, percent }: { name?: string; percent?: number }) =>
            `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | undefined, name: string | undefined) => [
            formatEuros(value ?? 0) + "/mois",
            name ?? "",
          ]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e4e4e7",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Legend
          formatter={(value: string) => (
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
