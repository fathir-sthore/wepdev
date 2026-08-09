const SITE_URL = "https://fathirsthore.my.id";

function wrapper(glowColor: string, glowColor2: string, bodyHtml: string) {
  return `
<div style="background-color:#090A0F; padding:40px 20px; font-family: Arial, Helvetica, sans-serif;">
  <div style="max-width:480px; margin:0 auto; background-color:#12141D; border:1px solid #2A2E43; border-radius:12px; overflow:hidden;">
    <div style="padding:24px 32px 8px; text-align:center;">
      <span style="color:#ffffff; font-family: 'Courier New', monospace; font-size:14px; letter-spacing:2px; text-shadow: 0 0 6px ${glowColor}, 0 0 14px ${glowColor2};">
        FATHIR STHORE
      </span>
    </div>
    <div style="padding:16px 32px 32px; text-align:center;">
      ${bodyHtml}
    </div>
    <div style="background-color:#090A0F; padding:16px; text-align:center; border-top:1px solid #2A2E43;">
      <p style="color:#8A92B2; font-size:11px; margin:0; font-family: 'Courier New', monospace;">
        © Fathir Sthore — Script Download Center
      </p>
    </div>
  </div>
</div>`;
}

export function purchaseConfirmationEmail(params: {
  scriptTitle: string;
  amount: number;
  orderId: string;
  downloadUrl: string;
}) {
  const body = `
    <h1 style="color:#ffffff; font-size:20px; margin:0 0 8px; text-shadow: 0 0 8px #7000FF, 0 0 16px #4A00AD;">
      Pembayaran Berhasil
    </h1>
    <p style="color:#8A92B2; font-size:14px; margin:0 0 20px;">
      Terima kasih! Pembelian script berikut sudah dikonfirmasi:
    </p>
    <div style="background-color:#1A1D2B; border:1px solid #2A2E43; border-radius:8px; padding:16px; margin:0 0 20px; text-align:left;">
      <p style="color:#F0F4FF; font-size:15px; margin:0 0 4px; font-weight:bold;">${params.scriptTitle}</p>
      <p style="color:#8A92B2; font-size:12px; margin:0; font-family:'Courier New',monospace;">order ${params.orderId} · Rp ${params.amount.toLocaleString("id-ID")}</p>
    </div>
    <a href="${params.downloadUrl}" style="display:inline-block; background-color:#00F0FF; color:#090A0F; font-family:'Courier New',monospace; font-weight:bold; padding:12px 28px; border-radius:6px; text-decoration:none; margin-bottom:16px;">
      Download Sekarang
    </a>
    <p style="color:#8A92B2; font-size:12px; margin:16px 0 0;">
      Script ini juga selalu tersedia lewat halaman "Purchases" di dashboard kamu.
    </p>`;
  return wrapper("#7000FF", "#4A00AD", body);
}

export function reviewReceivedEmail(params: {
  scriptTitle: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  scriptUrl: string;
}) {
  const stars = "★".repeat(params.rating) + "☆".repeat(5 - params.rating);
  const body = `
    <h1 style="color:#ffffff; font-size:20px; margin:0 0 8px; text-shadow: 0 0 8px #00F0FF, 0 0 16px #0B8A99;">
      Review Baru
    </h1>
    <p style="color:#8A92B2; font-size:14px; margin:0 0 20px;">
      <span style="color:#F0F4FF;">@${params.reviewerName}</span> kasih review buat script <strong style="color:#F0F4FF;">${params.scriptTitle}</strong>:
    </p>
    <div style="background-color:#1A1D2B; border:1px solid #2A2E43; border-radius:8px; padding:16px; margin:0 0 20px; text-align:left;">
      <p style="color:#00F0FF; font-size:18px; margin:0 0 6px;">${stars}</p>
      ${params.comment ? `<p style="color:#F0F4FF; font-size:13px; margin:0;">"${params.comment}"</p>` : ""}
    </div>
    <a href="${params.scriptUrl}" style="display:inline-block; background-color:#00F0FF; color:#090A0F; font-family:'Courier New',monospace; font-weight:bold; padding:12px 28px; border-radius:6px; text-decoration:none;">
      Lihat Script
    </a>`;
  return wrapper("#00F0FF", "#0B8A99", body);
}

export function reportFiledEmail(params: {
  scriptTitle: string;
  reason: string;
  details: string | null;
  adminUrl: string;
}) {
  const body = `
    <h1 style="color:#ffffff; font-size:20px; margin:0 0 8px; text-shadow: 0 0 8px #F2555A, 0 0 16px #8A2A30;">
      Laporan Baru
    </h1>
    <p style="color:#8A92B2; font-size:14px; margin:0 0 20px;">
      Ada laporan masuk untuk script <strong style="color:#F0F4FF;">${params.scriptTitle}</strong>:
    </p>
    <div style="background-color:#1A1D2B; border:1px solid #2A2E43; border-radius:8px; padding:16px; margin:0 0 20px; text-align:left;">
      <p style="color:#F2555A; font-size:13px; margin:0 0 6px; text-transform:uppercase;">${params.reason}</p>
      ${params.details ? `<p style="color:#F0F4FF; font-size:13px; margin:0;">${params.details}</p>` : ""}
    </div>
    <a href="${params.adminUrl}" style="display:inline-block; background-color:#F2555A; color:#ffffff; font-family:'Courier New',monospace; font-weight:bold; padding:12px 28px; border-radius:6px; text-decoration:none;">
      Tinjau di Admin Panel
    </a>`;
  return wrapper("#F2555A", "#8A2A30", body);
}

export function securityAlertEmail(params: { message: string }) {
  const body = `
    <h1 style="color:#ffffff; font-size:20px; margin:0 0 8px; text-shadow: 0 0 8px #F2555A, 0 0 16px #8A2A30;">
      Perubahan Keamanan Akun
    </h1>
    <p style="color:#8A92B2; font-size:14px; margin:0 0 20px;">
      ${params.message}
    </p>
    <p style="color:#8A92B2; font-size:12px; margin:0;">
      Kalau bukan kamu yang melakukan ini, segera amankan akunmu di
      <a href="${SITE_URL}/dashboard/profile" style="color:#00F0FF;">Profile &amp; Settings</a>.
    </p>`;
  return wrapper("#F2555A", "#8A2A30", body);
}
