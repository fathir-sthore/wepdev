import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { securityAlertEmail } from "@/lib/email/templates";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const { message } = await request.json().catch(() => ({ message: "Ada perubahan pada akunmu." }));
  const finalMessage = message || "Ada perubahan pada akunmu.";

  await Promise.all([
    sendTransactionalEmail({
      to: [{ email: user.email }],
      subject: "Perubahan keamanan akun — Fathir Sthore",
      html: securityAlertEmail({ message: finalMessage }),
    }),
    createNotification({
      userId: user.id,
      type: "security_alert",
      title: "Perubahan keamanan akun",
      message: finalMessage,
      linkUrl: "/dashboard/profile",
    }),
  ]);

  return NextResponse.json({ ok: true });
}
