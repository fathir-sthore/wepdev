import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { reviewReceivedEmail } from "@/lib/email/templates";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const { scriptId, rating, comment } = await request.json();
  if (!scriptId || !rating) {
    return NextResponse.json({ error: "scriptId and rating are required" }, { status: 400 });
  }

  try {
    const [{ data: script }, { data: reviewer }] = await Promise.all([
      supabase.from("scripts").select("id, slug, title, developer_id").eq("id", scriptId).maybeSingle(),
      supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
    ]);

    if (!script || script.developer_id === user.id) {
      // Don't notify developers about their own reviews (shouldn't normally
      // happen, but no reason to email yourself if it does).
      return NextResponse.json({ ok: true });
    }

    const admin = createAdminClient();
    const [{ data: devProfile }, { data: devAuthUser }] = await Promise.all([
      admin.from("profiles").select("email_notifications").eq("id", script.developer_id).maybeSingle(),
      admin.auth.admin.getUserById(script.developer_id),
    ]);

    if (!devProfile?.email_notifications) {
      return NextResponse.json({ ok: true, skipped: "notifications disabled" });
    }

    const email = devAuthUser?.user?.email;
    if (!email) return NextResponse.json({ ok: true });

    await sendTransactionalEmail({
      to: [{ email }],
      subject: `Review baru untuk ${script.title}`,
      html: reviewReceivedEmail({
        scriptTitle: script.title,
        reviewerName: reviewer?.username ?? "seseorang",
        rating,
        comment: comment ?? null,
        scriptUrl: `https://fathirsthore.my.id/script/${script.slug}`,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("failed to send review notification", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
