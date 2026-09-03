import Link from "next/link";
import { Code2, Users, Download, HardDrive, Star, Heart, DollarSign, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminStats } from "@/lib/queries/admin";
import { StatCard } from "@/components/admin/stat-card";
import { TrendChart } from "@/components/admin/trend-chart";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MigrateStorageButton } from "@/components/admin/migrate-storage-button";
import { formatFileSize, formatCount } from "@/lib/storage";

export const metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const stats = await getAdminStats(supabase);

  return (
    <div>
      <h1 className="text-title text-2xl text-text mb-6">Overview</h1>

      <div className="mb-8">
        <MigrateStorageButton />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard label="scripts" value={formatCount(stats.totalScripts)} icon={Code2} />
        <StatCard label="users" value={formatCount(stats.totalUsers)} icon={Users} />
        <StatCard label="downloads (all time)" value={formatCount(stats.totalDownloads)} icon={Download} />
        <StatCard label="storage used" value={formatFileSize(stats.storageUsedBytes)} icon={HardDrive} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="reviews" value={formatCount(stats.totalReviews)} icon={Star} />
        <StatCard label="favorites" value={formatCount(stats.totalFavorites)} icon={Heart} />
        <StatCard label="pendapatan (all time)" value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`} icon={DollarSign} />
        <StatCard label="pengunjung hari ini" value={formatCount(stats.visitorsToday)} icon={Eye} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <p className="font-mono text-sm text-text">Downloads — last 14 days</p>
          </CardHeader>
          <CardContent>
            <TrendChart data={stats.downloadsPerDay} color="var(--color-signal)" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="font-mono text-sm text-text">Uploads — last 14 days</p>
          </CardHeader>
          <CardContent>
            <TrendChart data={stats.uploadsPerDay} color="var(--color-accent)" />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
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
        <Card>
          <CardHeader>
            <p className="font-mono text-sm text-text">Pengunjung bulan ini</p>
          </CardHeader>
          <CardContent className="text-stat text-2xl text-accent">
            {formatCount(stats.visitorsThisMonth)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <p className="font-data text-xs text-muted leading-relaxed">
            <span className="text-text">catatan:</span> CPU/memory/bandwidth/API request bukan
            metrik yang relevan buat arsitektur serverless (Vercel + Supabase) — nggak ada satu
            server yang "diukur" karena tiap request jalan di function terpisah. Buat data itu,
            cek langsung{" "}
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Vercel Analytics/Observability
            </a>{" "}
            dan{" "}
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Supabase Reports
            </a>{" "}
            — itu sumber datanya yang sebenarnya, duplikasi di sini cuma akan basi/gak akurat.
          </p>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Link href={`/${ADMIN_BASE_PATH}/transactions`} className="text-sm text-accent hover:underline">
          Lihat detail transaksi &amp; pendapatan
        </Link>
      </div>
    </div>
  );
}
