"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { X, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Phase = "loading" | "pending" | "completed" | "expired" | "failed" | "cancelled" | "error";

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("00:00");
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return remaining;
}

export function PaymentModal({
  scriptId,
  scriptTitle,
  onClose,
}: {
  scriptId: string;
  scriptTitle: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdown = useCountdown(expiresAt);

  useEffect(() => {
    createPurchase();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createPurchase() {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed to create payment");

      setOrderId(data.orderId);
      setTotalPayment(data.totalPayment ?? data.amount);
      setExpiresAt(data.expiresAt);
      const dataUrl = await QRCode.toDataURL(data.qrString, { width: 280, margin: 1 });
      setQrDataUrl(dataUrl);
      setPhase("pending");
      startPolling(data.orderId);
    } catch (err: any) {
      setError(err.message ?? "something went wrong");
      setPhase("error");
    }
  }

  function startPolling(id: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/${id}/status`);
        const data = await res.json();
        if (data.status && data.status !== "pending") {
          setPhase(data.status);
          if (pollRef.current) clearInterval(pollRef.current);
          if (data.status === "completed") router.refresh();
        }
      } catch {
        // transient network error — keep polling
      }
    }, 3000);
  }

  async function handleCancel() {
    if (!orderId) return onClose();
    await fetch(`/api/payments/${orderId}/cancel`, { method: "POST" }).catch(() => {});
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-panel shadow-glow overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="font-data text-xs text-muted truncate">$ fathir pay --qris</span>
          <button onClick={onClose} className="text-muted hover:text-text">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center gap-4">
          <p className="font-mono text-sm text-text line-clamp-1">{scriptTitle}</p>

          {phase === "loading" && (
            <div className="py-12 flex flex-col items-center gap-3 text-muted">
              <Loader2 size={28} className="animate-spin" />
              <p className="font-data text-xs">creating payment...</p>
            </div>
          )}

          {phase === "pending" && qrDataUrl && (
            <>
              <img src={qrDataUrl} alt="QRIS code" width={220} height={220} className="rounded-md" />
              <p className="text-stat text-lg text-accent">{formatRupiah(totalPayment ?? 0)}</p>
              <p className="font-data text-xs text-muted">
                scan with any QRIS app (GoPay, OVO, ShopeePay, Dana, m-banking)
              </p>
              <p className="font-data text-xs text-signal">expires in {countdown}</p>
              <Button variant="ghost" size="sm" onClick={handleCancel} className="text-danger">
                cancel payment
              </Button>
            </>
          )}

          {phase === "completed" && (
            <div className="py-8 flex flex-col items-center gap-3">
              <CheckCircle2 size={40} className="text-signal" />
              <p className="font-mono text-sm text-text">payment successful</p>
              <Button onClick={onClose} className="w-full">continue</Button>
            </div>
          )}

          {(phase === "expired" || phase === "failed" || phase === "cancelled") && (
            <div className="py-8 flex flex-col items-center gap-3">
              <XCircle size={40} className="text-danger" />
              <p className="font-mono text-sm text-text">
                {phase === "expired" ? "payment expired" : phase === "cancelled" ? "payment cancelled" : "payment failed"}
              </p>
              <Button onClick={createPurchase} className="w-full">try again</Button>
            </div>
          )}

          {phase === "error" && (
            <div className="py-8 flex flex-col items-center gap-3">
              <XCircle size={40} className="text-danger" />
              <p className="font-data text-xs text-danger">{error}</p>
              <Button onClick={createPurchase} variant="outline" className="w-full">retry</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
