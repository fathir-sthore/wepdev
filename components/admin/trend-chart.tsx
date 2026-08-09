"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function TrendChart({
  data,
  color = "#00F0FF",
}: {
  data: { date: string; count: number }[];
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2E43" />
        <XAxis dataKey="date" stroke="#8A92B2" fontSize={11} />
        <YAxis stroke="#8A92B2" fontSize={11} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#12141D", border: "1px solid #2A2E43", fontSize: 12 }}
          labelStyle={{ color: "#F0F4FF" }}
        />
        <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
