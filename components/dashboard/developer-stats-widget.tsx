"use client";

import { Upload, Download, DollarSign, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCount } from "@/lib/storage";
import type { DeveloperStats } from "@/lib/queries/developer";

export function DeveloperStatsWidget({ stats }: { stats: DeveloperStats }) {
  const chartData = stats.topScripts.map((s) => ({
    name: s.title.length > 14 ? `${s.title.slice(0, 14)}…` : s.title,
    downloads: s.download_count,
  }));

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="total upload" value={formatCount(stats.totalScripts)} icon={Upload} />
        <StatCard label="total download" value={formatCount(stats.totalDownloads)} icon={Download} accent="purple" />
        <StatCard
          label="revenue"
          value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`}
          icon={DollarSign}
        />
        <StatCard label="views" value={formatCount(stats.totalViews)} icon={Eye} accent="purple" />
      </div>

      {chartData.length > 0 && (
        <Card className="bg-panel2">
          <CardHeader>
            <p className="font-mono text-sm text-text">Performa script (top downloads)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted)" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--color-muted)"
                  fontSize={11}
                  width={100}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ background: "var(--color-panel)", border: "1px solid var(--color-line)", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-soft)" }}
                  labelStyle={{ color: "var(--color-text)" }}
                  cursor={{ fill: "var(--color-panel2)" }}
                />
                <Bar dataKey="downloads" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
