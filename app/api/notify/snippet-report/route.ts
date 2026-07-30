import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { reportFiledEmail } from "@/lib/email/templates";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const { snippetId, reason, details } = await request.json();
  if (!snippetId || !reason) {
    return NextResponse.json({ error: "snippetId and reason are required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: snippet } = await supabase
      .from("code_snippets")
      .select("id, slug, title, user_id")
      .eq("id", snippetId)
      .maybeSingle();

    if (!snippet) return NextResponse.json({ ok: true });

    const admin = createAdminClient();

    await createNotification({
      userId: snippet.user_id,
      type: "report_filed",
      title: "Kode kamu dilaporkan",
      message: `${reason} — ${snippet.title}`,
      linkUrl: `/code/${snippet.slug}`,
    });

    const { data: ownerAuthUser } = await admin.auth.admin.getUserById(snippet.user_id);
    const email = ownerAuthUser?.user?.email;
    if (!email) return NextResponse.json({ ok: true });

    await sendTransactionalEmail({
      to: [{ email }],
      subject: `Laporan masuk buat kode: ${snippet.title}`,
      html: reportFiledEmail({
        scriptTitle: snippet.title,
        reason,
        details: details ?? null,
        adminUrl: `https://fathirsthore.my.id/code/${snippet.slug}`,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("failed to send snippet report notification", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
