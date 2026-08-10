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
        <Card className="bg-panel2/40 backdrop-blur-glass">
          <CardHeader>
            <p className="font-mono text-sm text-text">Performa script (top downloads)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2E43" horizontal={false} />
                <XAxis type="number" stroke="#8A92B2" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#8A92B2"
                  fontSize={11}
                  width={100}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ background: "#12141D", border: "1px solid #2A2E43", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#F0F4FF" }}
                  cursor={{ fill: "rgba(0,240,255,0.06)" }}
                />
                <Bar dataKey="downloads" fill="#00F0FF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
