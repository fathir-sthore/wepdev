const BASE_URL = "https://app.pakasir.com/api";

function credentials() {
  const project = process.env.PAKASIR_PROJECT_SLUG;
  const apiKey = process.env.PAKASIR_API_KEY;
  if (!project || !apiKey) {
    throw new Error("PAKASIR_PROJECT_SLUG / PAKASIR_API_KEY are not configured");
  }
  return { project, apiKey };
}

export type PakasirPaymentMethod =
  | "qris"
  | "bni_va"
  | "bri_va"
  | "cimb_niaga_va"
  | "sampoerna_va"
  | "bnc_va"
  | "maybank_va"
  | "permata_va"
  | "atm_bersama_va"
  | "artha_graha_va";

type PakasirPayment = {
  project: string;
  order_id: string;
  amount: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  payment_number: string;
  expired_at: string;
};

type PakasirTransaction = {
  amount: number;
  order_id: string;
  project: string;
  status: "pending" | "completed" | "failed" | "expired" | "cancelled" | string;
  payment_method: string;
  completed_at?: string;
};

/** POST /api/transactioncreate/{method} */
export async function createPakasirTransaction(
  orderId: string,
  amount: number,
  method: PakasirPaymentMethod = "qris"
): Promise<PakasirPayment> {
  const { project, apiKey } = credentials();

  const res = await fetch(`${BASE_URL}/transactioncreate/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project, order_id: orderId, amount, api_key: apiKey }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pakasir transactioncreate failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.payment as PakasirPayment;
}

/**
 * GET /api/transactiondetail — Pakasir's docs explicitly recommend using this
 * to confirm real status rather than trusting the webhook body alone, so
 * both the webhook route and the client-facing status-poll route call this.
 */
export async function getPakasirTransactionDetail(
  orderId: string,
  amount: number
): Promise<PakasirTransaction> {
  const { project, apiKey } = credentials();

  const params = new URLSearchParams({
    project,
    amount: String(amount),
    order_id: orderId,
    api_key: apiKey,
  });

  const res = await fetch(`${BASE_URL}/transactiondetail?${params.toString()}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pakasir transactiondetail failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.transaction as PakasirTransaction;
}

/** POST /api/transactioncancel */
export async function cancelPakasirTransaction(orderId: string, amount: number) {
  const { project, apiKey } = credentials();

  const res = await fetch(`${BASE_URL}/transactioncancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project, order_id: orderId, amount, api_key: apiKey }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pakasir transactioncancel failed (${res.status}): ${text}`);
  }

  return res.json();
}

export function generateOrderId(scriptId: string) {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FS${time}${scriptId.slice(0, 4).toUpperCase()}${random}`;
}
