import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { reviewReceivedEmail } from "@/lib/email/templates";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const { snippetId, rating, comment } = await request.json();
  if (!snippetId || !rating) {
    return NextResponse.json({ error: "snippetId and rating are required" }, { status: 400 });
  }

  try {
    const [{ data: snippet }, { data: commenter }] = await Promise.all([
      supabase.from("code_snippets").select("id, slug, title, user_id").eq("id", snippetId).maybeSingle(),
      supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
    ]);

    if (!snippet || snippet.user_id === user.id) {
      return NextResponse.json({ ok: true });
    }

    const admin = createAdminClient();
    const [{ data: ownerProfile }, { data: ownerAuthUser }] = await Promise.all([
      admin.from("profiles").select("email_notifications").eq("id", snippet.user_id).maybeSingle(),
      admin.auth.admin.getUserById(snippet.user_id),
    ]);

    await createNotification({
      userId: snippet.user_id,
      type: "review_received",
      title: "Komentar baru di kode kamu",
      message: `@${commenter?.username ?? "seseorang"} kasih rating ${rating}★ buat ${snippet.title}`,
      linkUrl: `/code/${snippet.slug}`,
    });

    if (!ownerProfile?.email_notifications) {
      return NextResponse.json({ ok: true, skipped: "email notifications disabled" });
    }

    const email = ownerAuthUser?.user?.email;
    if (!email) return NextResponse.json({ ok: true });

    await sendTransactionalEmail({
      to: [{ email }],
      subject: `Komentar baru di kode: ${snippet.title}`,
      html: reviewReceivedEmail({
        scriptTitle: snippet.title,
        reviewerName: commenter?.username ?? "seseorang",
        rating,
        comment: comment ?? null,
        scriptUrl: `https://fathirsthore.my.id/code/${snippet.slug}`,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("failed to send snippet comment notification", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
