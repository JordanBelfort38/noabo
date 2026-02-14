"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface SourceData {
  name: string;
  value: number;
  color: string;
}

interface SourcesPieChartProps {
  data: SourceData[];
}

export function SourcesPieChart({ data }: SourcesPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            color: "#f4f4f5",
          }}
          formatter={(value?: number) => [`${value ?? 0}%`, ""]}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          formatter={(value: string) => (
            <span className="text-sm text-zinc-400">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
