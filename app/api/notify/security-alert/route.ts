import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { securityAlertEmail } from "@/lib/email/templates";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const { message } = await request.json().catch(() => ({ message: "Ada perubahan pada akunmu." }));

  await sendTransactionalEmail({
    to: [{ email: user.email }],
    subject: "Perubahan keamanan akun — Fathir Sthore",
    html: securityAlertEmail({ message: message || "Ada perubahan pada akunmu." }),
  });

  return NextResponse.json({ ok: true });
}
