import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Supabase = SupabaseClient<Database>;

function lastNDays(n: number) {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function bucketByDay(rows: { created_at: string }[], days: string[]) {
  const counts = new Map(days.map((d) => [d, 0]));
  for (const row of rows) {
    const day = row.created_at.slice(0, 10);
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return days.map((d) => ({ date: d.slice(5), count: counts.get(d) ?? 0 }));
}

export async function getAdminStats(supabase: Supabase) {
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    scriptsCountRes,
    usersCountRes,
    downloadsRes,
    uploadsRes,
    popularRes,
    sizeRes,
    reviewsCountRes,
    favoritesCountRes,
    revenueRes,
    visitorsTodayRes,
    visitorsMonthRes,
  ] = await Promise.all([
    supabase.from("scripts").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("downloads").select("created_at").gte("created_at", since.toISOString()),
    supabase.from("scripts").select("created_at").gte("created_at", since.toISOString()),
    supabase
      .from("scripts")
      .select("id, title, slug, download_count")
      .order("download_count", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("scripts").select("file_size_bytes"),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase.from("favorites").select("id", { count: "exact", head: true }),
    supabase.from("purchases").select("total_payment, amount").eq("status", "completed"),
    supabase.from("views").select("ip_hash, user_id").gte("created_at", startOfToday.toISOString()),
    supabase.from("views").select("ip_hash, user_id").gte("created_at", startOfMonth.toISOString()),
  ]);

  const days = lastNDays(14);
  const totalDownloadsAllTime = await supabase
    .from("scripts")
    .select("download_count");

  const storageUsedBytes = (sizeRes.data ?? []).reduce(
    (sum, row) => sum + (row.file_size_bytes ?? 0),
    0
  );
  const totalDownloads = (totalDownloadsAllTime.data ?? []).reduce(
    (sum, row) => sum + (row.download_count ?? 0),
    0
  );
  const totalRevenue = (revenueRes.data ?? []).reduce(
    (sum, row) => sum + (row.total_payment ?? row.amount ?? 0),
    0
  );

  // "Visitors" approximated as distinct user/ip signatures on script views —
  // we don't track site-wide pageviews outside script pages.
  function countUnique(rows: { ip_hash: string | null; user_id: string | null }[]) {
    return new Set(rows.map((r) => r.user_id ?? r.ip_hash ?? Math.random())).size;
  }

  return {
    totalScripts: scriptsCountRes.count ?? 0,
    totalUsers: usersCountRes.count ?? 0,
    totalDownloads,
    storageUsedBytes,
    totalReviews: reviewsCountRes.count ?? 0,
    totalFavorites: favoritesCountRes.count ?? 0,
    totalRevenue,
    visitorsToday: countUnique(visitorsTodayRes.data ?? []),
    visitorsThisMonth: countUnique(visitorsMonthRes.data ?? []),
    popularScript: popularRes.data,
    downloadsPerDay: bucketByDay(downloadsRes.data ?? [], days),
    uploadsPerDay: bucketByDay(uploadsRes.data ?? [], days),
  };
}

export async function getAllScriptsAdmin(
  supabase: Supabase,
  { status, page = 1 }: { status?: "draft" | "published" | "archived"; page?: number }
) {
  const pageSize = 15;
  const from = (page - 1) * pageSize;

  let query = supabase.from("scripts").select("*", { count: "exact" });
  if (status) query = query.eq("status", status);
  query = query.order("created_at", { ascending: false }).range(from, from + pageSize - 1);

  const { data, count } = await query;
  return { scripts: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getAllReports(supabase: Supabase) {
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!reports || reports.length === 0) return [];

  const scriptIds = [...new Set(reports.map((r) => r.script_id))];
  const { data: scripts } = await supabase
    .from("scripts")
    .select("id, title, slug")
    .in("id", scriptIds);
  const scriptMap = new Map((scripts ?? []).map((s) => [s.id, s]));

  return reports.map((r) => ({ ...r, script: scriptMap.get(r.script_id) ?? null }));
}

export async function getAllUsers(supabase: Supabase, { page = 1 }: { page?: number }) {
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  const { data, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  return { users: data ?? [], total: count ?? 0, page, pageSize };
}
