/**
 * Pakasir v2 client. v1 (the old /api/transactioncreate etc. endpoints)
 * is deprecated and shuts down 2026-10-20 — docs verified directly against
 * pakasir.com/p/{create-transaction,transaction-status,cancel-transaction}
 * before writing this.
 *
 * The core architectural change from v1: transactions are identified by an
 * opaque `txn_id` returned from create-transaction, not by order_id+amount.
 * Status checks and cancellation both require that txn_id going forward —
 * callers must persist it (purchases.pakasir_txn_id).
 */
const BASE_URL = "https://app.pakasir.com/api/v2";

function credentials() {
  const project = process.env.PAKASIR_PROJECT_SLUG;
  const apiKey = process.env.PAKASIR_API_KEY;
  if (!project || !apiKey) {
    throw new Error("PAKASIR_PROJECT_SLUG / PAKASIR_API_KEY are not configured");
  }
  return { project, apiKey };
}

export type PakasirPaymentMethod =
  | "payment_link"
  | "qris"
  | "bri_va"
  | "bni_va"
  | "cimb_niaga_va"
  | "permata_va"
  | "maybank_va"
  | "bnc_va"
  | "artha_graha_va"
  | "sampoerna_va";

export type PakasirStatus = "pending" | "completed" | "canceled";

type PakasirCreateResponse = {
  txn_id: string;
  payment_link?: string;
  project?: string;
  order_id?: string;
  amount?: number;
  fee?: number;
  total_payment?: number;
  payment_method?: string;
  qr_string?: string;
  va_number?: string;
  expired_at?: string;
  is_sandbox?: boolean;
  status?: PakasirStatus;
  completed_at?: string | null;
};

type PakasirStatusResponse = {
  txn_id: string;
  order_id: string;
  amount: number;
  is_sandbox: boolean;
  status: PakasirStatus;
  completed_at: string | null;
};

/** POST /api/v2/create-transaction/{slug}/{order_id} */
export async function createPakasirTransaction(
  orderId: string,
  amount: number,
  method: PakasirPaymentMethod = "qris"
): Promise<PakasirCreateResponse> {
  const { project, apiKey } = credentials();

  const res = await fetch(`${BASE_URL}/create-transaction/${project}/${orderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
    body: JSON.stringify({ method, amount }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pakasir create-transaction failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * GET /api/v2/transaction-status/{slug}/{txn_id}
 * Rate limit per Pakasir's docs: once per 4 seconds per transaction —
 * callers (syncPurchaseStatus, and the client poll interval it backs)
 * must not call this more often than that for the same txn_id.
 */
export async function getPakasirTransactionStatus(txnId: string): Promise<PakasirStatusResponse> {
  const { project, apiKey } = credentials();

  const res = await fetch(`${BASE_URL}/transaction-status/${project}/${txnId}`, {
    headers: { "X-Api-Key": apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pakasir transaction-status failed (${res.status}): ${text}`);
  }

  return res.json();
}

/** POST /api/v2/cancel-transaction/{slug}/{txn_id} */
export async function cancelPakasirTransaction(txnId: string) {
  const { project, apiKey } = credentials();

  const res = await fetch(`${BASE_URL}/cancel-transaction/${project}/${txnId}`, {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pakasir cancel-transaction failed (${res.status}): ${text}`);
  }

  return res.json();
}

export function generateOrderId(scriptId: string) {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FS${time}${scriptId.slice(0, 4).toUpperCase()}${random}`;
}
