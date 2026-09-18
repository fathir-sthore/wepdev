import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the current request's session belongs to an admin. Used by
 * API routes that perform privileged actions (creating/banning users)
 * which must go through the service-role client — the admin layout's
 * page-level redirect only protects page navigation, not API routes
 * hit directly.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, error: "Belum login" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false as const, status: 403, error: "Bukan admin" };
  }

  return { ok: true as const, user };
}
