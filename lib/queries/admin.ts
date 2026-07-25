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

  const [scriptsCountRes, usersCountRes, downloadsRes, uploadsRes, popularRes, sizeRes] =
    await Promise.all([
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

  return {
    totalScripts: scriptsCountRes.count ?? 0,
    totalUsers: usersCountRes.count ?? 0,
    totalDownloads,
    storageUsedBytes,
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
