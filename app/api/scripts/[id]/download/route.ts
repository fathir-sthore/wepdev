import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashIp, getClientIp } from "@/lib/ip";
import { hasCompletedPurchase } from "@/lib/payments/entitlement";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: script } = await supabase
    .from("scripts")
    .select("id, file_path, status, is_premium, developer_id, password_zip")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (!script || !script.file_path) {
    return NextResponse.json({ error: "script not found" }, { status: 404 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (script.is_premium) {
    if (!user) {
      return NextResponse.json({ error: "login required to download a premium script" }, { status: 401 });
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const isOwnerOrAdmin = user.id === script.developer_id || profile?.role === "admin";

    if (!isOwnerOrAdmin && !(await hasCompletedPurchase(supabase, user.id, script.id))) {
      return NextResponse.json({ error: "purchase required" }, { status: 402 });
    }
  }

  if (script.password_zip) {
    const submittedPassword = searchParams.get("password");
    if (submittedPassword !== script.password_zip) {
      return NextResponse.json({ error: "password salah" }, { status: 403 });
    }
  }

  const { data: signed, error } = await admin.storage
    .from("scripts")
    .createSignedUrl(script.file_path, 60);

  if (error || !signed) {
    return NextResponse.json({ error: "file unavailable" }, { status: 500 });
  }

  await supabase.from("downloads").insert({
    script_id: script.id,
    user_id: user?.id ?? null,
    ip_hash: hashIp(getClientIp(request)),
  });

  return NextResponse.redirect(signed.signedUrl);
}
