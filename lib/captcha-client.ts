/** Calls our server-side /api/captcha/verify route with a Turnstile token.
 * Shared by login/register/forgot-password forms so the check-before-submit
 * logic isn't duplicated three times. */
export async function verifyCaptcha(token: string | null): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/captcha/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await res.json().catch(() => ({ success: false }));
  if (!data.success) {
    return { ok: false, error: "Verifikasi CAPTCHA gagal, coba lagi." };
  }
  return { ok: true };
}
