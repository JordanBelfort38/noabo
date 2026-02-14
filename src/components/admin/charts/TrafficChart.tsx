"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrafficChartProps {
  data: { date: string; visitors: number; sessions: number }[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
        <XAxis
          dataKey="date"
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            color: "#f4f4f5",
          }}
        />
        <Area
          type="monotone"
          dataKey="visitors"
          name="Visiteurs"
          stroke="#3B82F6"
          fillOpacity={1}
          fill="url(#colorVisitors)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="sessions"
          name="Sessions"
          stroke="#10B981"
          fillOpacity={1}
          fill="url(#colorSessions)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
