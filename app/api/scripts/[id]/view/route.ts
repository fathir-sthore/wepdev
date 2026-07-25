import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashIp, getClientIp } from "@/lib/ip";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("views").insert({
    script_id: id,
    user_id: user?.id ?? null,
    ip_hash: hashIp(getClientIp(request)),
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
