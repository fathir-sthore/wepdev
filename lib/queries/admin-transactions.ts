import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Supabase = SupabaseClient<Database>;
type Purchase = Database["public"]["Tables"]["purchases"]["Row"];

function lastNDays(n: number) {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function lastNMonths(n: number) {
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

export async function getTransactionStats(supabase: Supabase) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const [completedRes, pendingRes, recentRes] = await Promise.all([
    supabase.from("purchases").select("*").eq("status", "completed"),
    supabase.from("purchases").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("purchases")
      .select("*")
      .eq("status", "completed")
      .gte("completed_at", twelveMonthsAgo.toISOString()),
  ]);

  const completed = completedRes.data ?? [];
  const totalRevenue = completed.reduce((sum, p) => sum + (p.total_payment ?? p.amount), 0);
  const totalTransactions = completed.length;

  // Daily revenue (last 30 days)
  const days = lastNDays(30);
  const dailyMap = new Map(days.map((d) => [d, 0]));
  for (const p of recentRes.data ?? []) {
    const day = (p.completed_at ?? p.created_at).slice(0, 10);
    if (dailyMap.has(day)) dailyMap.set(day, (dailyMap.get(day) ?? 0) + (p.total_payment ?? p.amount));
  }
  const dailyRevenue = days.map((d) => ({ date: d.slice(5), count: Math.round(dailyMap.get(d) ?? 0) }));

  // Monthly revenue (last 12 months)
  const months = lastNMonths(12);
  const monthlyMap = new Map(months.map((m) => [m, 0]));
  for (const p of recentRes.data ?? []) {
    const month = (p.completed_at ?? p.created_at).slice(0, 7);
    if (monthlyMap.has(month)) monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + (p.total_payment ?? p.amount));
  }
  const monthlyRevenue = months.map((m) => ({ date: m.slice(2), count: Math.round(monthlyMap.get(m) ?? 0) }));

  // Best selling scripts
  const scriptCounts = new Map<string, { count: number; revenue: number }>();
  for (const p of completed) {
    const existing = scriptCounts.get(p.script_id) ?? { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += p.total_payment ?? p.amount;
    scriptCounts.set(p.script_id, existing);
  }
  const topScriptIds = [...scriptCounts.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 10);
  const { data: topScripts } = topScriptIds.length
    ? await supabase.from("scripts").select("id, title, slug").in("id", topScriptIds.map(([id]) => id))
    : { data: [] };
  const bestSellingScripts = topScriptIds.map(([id, stats]) => ({
    script: (topScripts ?? []).find((s) => s.id === id) ?? null,
    ...stats,
  }));

  // Most active users (by completed purchase count)
  const userCounts = new Map<string, { count: number; spent: number }>();
  for (const p of completed) {
    const existing = userCounts.get(p.user_id) ?? { count: 0, spent: 0 };
    existing.count += 1;
    existing.spent += p.total_payment ?? p.amount;
    userCounts.set(p.user_id, existing);
  }
  const topUserIds = [...userCounts.entries()].sort((a, b) => b[1].spent - a[1].spent).slice(0, 10);
  const { data: topUsers } = topUserIds.length
    ? await supabase.from("profiles").select("id, username, avatar_url").in("id", topUserIds.map(([id]) => id))
    : { data: [] };
  const mostActiveUsers = topUserIds.map(([id, stats]) => ({
    user: (topUsers ?? []).find((u) => u.id === id) ?? null,
    ...stats,
  }));

  return {
    totalRevenue,
    totalTransactions,
    pendingCount: pendingRes.count ?? 0,
    dailyRevenue,
    monthlyRevenue,
    bestSellingScripts,
    mostActiveUsers,
  };
}

export async function getAllTransactions(
  supabase: Supabase,
  { status, page = 1 }: { status?: "pending" | "completed" | "failed" | "expired" | "cancelled"; page?: number }
) {
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = supabase.from("purchases").select("*", { count: "exact" });
  if (status) query = query.eq("status", status);
  query = query.order("created_at", { ascending: false }).range(from, from + pageSize - 1);

  const { data, count } = await query;
  const purchases = data ?? [];

  const scriptIds = [...new Set(purchases.map((p) => p.script_id))];
  const userIds = [...new Set(purchases.map((p) => p.user_id))];

  const [{ data: scripts }, { data: users }] = await Promise.all([
    scriptIds.length ? supabase.from("scripts").select("id, title, slug").in("id", scriptIds) : Promise.resolve({ data: [] }),
    userIds.length ? supabase.from("profiles").select("id, username").in("id", userIds) : Promise.resolve({ data: [] }),
  ]);

  const scriptMap = new Map((scripts ?? []).map((s) => [s.id, s]));
  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const enriched = purchases.map((p) => ({
    ...p,
    script: scriptMap.get(p.script_id) ?? null,
    buyer: userMap.get(p.user_id) ?? null,
  }));

  return { transactions: enriched, total: count ?? 0, page, pageSize };
}
