"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function TrendChart({
  data,
  color = "#F2B33D",
}: {
  data: { date: string; count: number }[];
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262B36" />
        <XAxis dataKey="date" stroke="#8A93A3" fontSize={11} />
        <YAxis stroke="#8A93A3" fontSize={11} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#12151C", border: "1px solid #262B36", fontSize: 12 }}
          labelStyle={{ color: "#E7E9EE" }}
        />
        <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
