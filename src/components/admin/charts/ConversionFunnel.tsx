"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface FunnelStep {
  name: string;
  value: number;
  color: string;
}

interface ConversionFunnelProps {
  data: FunnelStep[];
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#27272a"
          opacity={0.3}
          horizontal={false}
        />
        <XAxis
          type="number"
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          dataKey="name"
          type="category"
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={150}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            color: "#f4f4f5",
          }}
          formatter={(value?: number) => [(value ?? 0).toLocaleString("fr-FR"), "Utilisateurs"]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
