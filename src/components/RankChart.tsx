"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type RankPoint = { date: string; [keyword: string]: string | number | null };

const LINE_COLORS = ["#3b82f6", "#f59e0b", "#34d399", "#a78bfa", "#fb7185"];

export default function RankChart({
  points,
  keywords,
}: {
  points: RankPoint[];
  keywords: string[];
}) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Keyword ranking positions over time (lower is better)">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            {keywords.map((k, i) => (
              <linearGradient key={k} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE_COLORS[i % 5]} stopOpacity={0.25} />
                <stop offset="100%" stopColor={LINE_COLORS[i % 5]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#1c2230" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" stroke="#5c667e" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            reversed
            domain={[1, "dataMax + 4"]}
            stroke="#5c667e"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            label={undefined}
          />
          <Tooltip
            contentStyle={{
              background: "#0b0d12",
              border: "1px solid #2a3347",
              borderRadius: 8,
              fontSize: 12,
              color: "#e6eaf2",
            }}
            formatter={(value: unknown, name: unknown) => [`#${value}`, String(name)]}
          />
          {keywords.map((k, i) => (
            <Area
              key={k}
              type="monotone"
              dataKey={k}
              stroke={LINE_COLORS[i % 5]}
              strokeWidth={2}
              fill={`url(#grad-${i})`}
              connectNulls
              dot={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
