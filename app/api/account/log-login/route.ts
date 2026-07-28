import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashIp, getClientIp } from "@/lib/ip";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const { method } = await request.json().catch(() => ({ method: "unknown" }));

  await supabase.from("login_history").insert({
    user_id: user.id,
    method: method || "unknown",
    ip_hash: hashIp(getClientIp(request)),
    user_agent: request.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}
