import { Code2, Users, Download, HardDrive } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminStats } from "@/lib/queries/admin";
import { StatCard } from "@/components/admin/stat-card";
import { TrendChart } from "@/components/admin/trend-chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatFileSize, formatCount } from "@/lib/storage";

export const metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const stats = await getAdminStats(supabase);

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir admin --stats</p>
      <h1 className="font-mono text-2xl text-text mb-6">Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="scripts" value={formatCount(stats.totalScripts)} icon={Code2} />
        <StatCard label="users" value={formatCount(stats.totalUsers)} icon={Users} />
        <StatCard label="downloads (all time)" value={formatCount(stats.totalDownloads)} icon={Download} />
        <StatCard label="storage used" value={formatFileSize(stats.storageUsedBytes)} icon={HardDrive} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <p className="font-mono text-sm text-text">Downloads — last 14 days</p>
          </CardHeader>
          <CardContent>
            <TrendChart data={stats.downloadsPerDay} color="#33E0C2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="font-mono text-sm text-text">Uploads — last 14 days</p>
          </CardHeader>
          <CardContent>
            <TrendChart data={stats.uploadsPerDay} color="#F2B33D" />
          </CardContent>
        </Card>
      </div>

      {stats.popularScript && (
        <Card>
          <CardHeader>
            <p className="font-mono text-sm text-text">Most popular script</p>
          </CardHeader>
          <CardContent className="flex items-center justify-between font-data text-sm">
            <span className="text-text">{stats.popularScript.title}</span>
            <span className="text-muted">{formatCount(stats.popularScript.download_count)} downloads</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
