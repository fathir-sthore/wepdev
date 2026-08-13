import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { reportFiledEmail } from "@/lib/email/templates";
import { createNotification } from "@/lib/notifications";
import { SITE_URL } from "@/lib/site-url";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";

export async function POST(request: Request) {
  const { scriptId, reason, details } = await request.json();
  if (!scriptId || !reason) {
    return NextResponse.json({ error: "scriptId and reason are required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: script } = await supabase
      .from("scripts")
      .select("title")
      .eq("id", scriptId)
      .maybeSingle();

    if (!script) return NextResponse.json({ ok: true });

    const admin = createAdminClient();
    const { data: admins } = await admin.from("profiles").select("id").eq("role", "admin");

    await Promise.all(
      (admins ?? []).map((a) =>
        createNotification({
          userId: a.id,
          type: "report_filed",
          title: "Laporan baru",
          message: `${reason} — ${script.title}`,
          linkUrl: `/${ADMIN_BASE_PATH}/reports`,
        })
      )
    );

    const emails: { email: string }[] = [];
    for (const a of admins ?? []) {
      const { data } = await admin.auth.admin.getUserById(a.id);
      if (data?.user?.email) emails.push({ email: data.user.email });
    }

    if (emails.length === 0) return NextResponse.json({ ok: true });

    await sendTransactionalEmail({
      to: emails,
      subject: `Laporan baru: ${script.title}`,
      html: reportFiledEmail({
        scriptTitle: script.title,
        reason,
        details: details ?? null,
        adminUrl: `${SITE_URL}/${ADMIN_BASE_PATH}/reports`,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("failed to send report notification", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
