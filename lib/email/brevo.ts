const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// Same verified sender used for Supabase Auth's SMTP relay — see
// Brevo → Senders in the dashboard. Swap to a fathirsthore.my.id address
// once that domain is verified as a sender in Brevo.
const DEFAULT_SENDER = { name: "Fathir Sthore", email: "noreply@fathire.store" };

export async function sendTransactionalEmail({
  to,
  subject,
  html,
}: {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("BREVO_API_KEY is not configured — skipping email send");
    return { skipped: true };
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: DEFAULT_SENDER,
      to,
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Brevo send failed (${res.status}): ${text}`);
    return { ok: false };
  }

  return { ok: true };
}
