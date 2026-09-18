import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

// Supabase's ban_duration has no literal "forever" value — a very long
// duration is the documented way to represent a permanent suspension.
const PERMANENT_BAN = "876000h"; // ~100 years

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status });
  }

  const { id } = await params;

  if (id === admin.user.id) {
    return NextResponse.json(
      { ok: false, error: "Tidak bisa suspend akun sendiri" },
      { status: 400 }
    );
  }

  let body: { action?: "suspend" | "unsuspend"; hours?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body request tidak valid" }, { status: 400 });
  }

  if (body.action !== "suspend" && body.action !== "unsuspend") {
    return NextResponse.json({ ok: false, error: "action harus 'suspend' atau 'unsuspend'" }, { status: 400 });
  }

  const banDuration =
    body.action === "unsuspend"
      ? "none"
      : body.hours && body.hours > 0
        ? `${Math.floor(body.hours)}h`
        : PERMANENT_BAN;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.updateUserById(id, {
    ban_duration: banDuration,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Gagal mengubah status akun" },
      { status: 422 }
    );
  }

  return NextResponse.json({
    ok: true,
    data: {
      id,
      banned_until: data.user.banned_until ?? null,
    },
  });
}
