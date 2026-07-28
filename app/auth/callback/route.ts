import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashIp, getClientIp } from "@/lib/ip";

// Handles both the OAuth redirect (code) and email confirmation links.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const provider = data.user?.app_metadata?.provider ?? "oauth";
      await supabase.from("login_history").insert({
        user_id: data.user!.id,
        method: provider,
        ip_hash: hashIp(getClientIp(request)),
        user_agent: request.headers.get("user-agent"),
      });
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
