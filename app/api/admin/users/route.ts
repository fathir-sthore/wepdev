import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,}$/;

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status });
  }

  let body: { email?: string; password?: string; username?: string; display_name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body request tidak valid" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const username = body.username?.trim();
  const displayName = body.display_name?.trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Email tidak valid" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Password minimal 8 karakter" }, { status: 400 });
  }
  if (username && !USERNAME_PATTERN.test(username)) {
    return NextResponse.json(
      { ok: false, error: "Username minimal 3 karakter, hanya huruf/angka/underscore" },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // admin-created accounts skip the verification email
    user_metadata: displayName ? { full_name: displayName } : undefined,
  });

  if (createError || !created.user) {
    const message =
      createError?.message?.includes("already been registered") || createError?.status === 422
        ? "Email sudah terdaftar"
        : createError?.message || "Gagal membuat akun";
    return NextResponse.json({ ok: false, error: message }, { status: 422 });
  }

  // The signup trigger already created a profile row with a username
  // slugged from the email — override it if the admin asked for a
  // specific one. Not fatal if this fails; the account itself is created.
  if (username) {
    const { error: usernameError } = await adminClient
      .from("profiles")
      .update({ username })
      .eq("id", created.user.id);

    if (usernameError) {
      return NextResponse.json({
        ok: true,
        data: { id: created.user.id, email },
        warning: usernameError.message.includes("duplicate")
          ? "Akun dibuat, tapi username sudah dipakai — username otomatis dari email dipakai sebagai gantinya"
          : "Akun dibuat, tapi gagal mengatur username custom",
      });
    }
  }

  return NextResponse.json({ ok: true, data: { id: created.user.id, email, username } });
}
