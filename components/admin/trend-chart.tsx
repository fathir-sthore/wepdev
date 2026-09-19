"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function TrendChart({
  data,
  color = "var(--color-accent)",
}: {
  data: { date: string; count: number }[];
  color?: string;
}) {
  // color can now be a literal hex or a CSS var() reference (e.g.
  // "var(--color-accent)") for automatic light/dark theming — strip
  // anything that isn't a safe SVG id character either way.
  const gradientId = `trend-gradient-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="date" stroke="var(--color-muted)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--color-muted)" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "var(--color-panel)",
            border: "1px solid var(--color-line)",
            borderRadius: 12,
            fontSize: 12,
            boxShadow: "var(--shadow-soft), var(--glow-accent)",
          }}
          labelStyle={{ color: "var(--color-text)" }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 5, fill: color, stroke: "var(--color-panel)", strokeWidth: 2 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
