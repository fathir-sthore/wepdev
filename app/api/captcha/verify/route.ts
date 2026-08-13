import { NextResponse } from "next/server";

/**
 * Verifies a Cloudflare Turnstile token server-side before allowing an auth
 * action (register / login / forgot-password) to proceed. The secret key
 * never touches the browser — only used here, server-only env var.
 */
export async function POST(request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // CAPTCHA not configured yet (e.g. local dev without the env var) —
    // fail open so it doesn't block development, but log loudly.
    console.warn("[captcha] TURNSTILE_SECRET_KEY is not set — skipping verification");
    return NextResponse.json({ success: true, skipped: true });
  }

  const { token } = await request.json().catch(() => ({ token: null }));
  if (!token || typeof token !== "string") {
    return NextResponse.json({ success: false, error: "missing captcha token" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    }),
  });

  const result = await verifyRes.json();

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: "captcha verification failed", codes: result["error-codes"] },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
