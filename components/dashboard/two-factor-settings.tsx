"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/otp-input";
import { ShieldCheck, ShieldOff } from "lucide-react";

type Factor = { id: string; friendly_name?: string; status: string };

export function TwoFactorSettings() {
  const supabase = createClient();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []).filter((f) => f.status === "verified"));
    setLoading(false);
  }

  async function startEnroll() {
    setError(null);
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setEnrolling(true);
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setBusy(true);
    setError(null);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setBusy(false);
      setError(challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    setBusy(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setEnrolling(false);
    setQrCode(null);
    setSecret(null);
    setCode("");
    refresh();
  }

  async function disable(id: string) {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    refresh();
  }

  if (loading) return <p className="font-data text-xs text-muted">memuat...</p>;

  if (factors.length > 0) {
    return (
      <div className="max-w-sm space-y-3">
        <p className="flex items-center gap-2 font-data text-sm text-signal">
          <ShieldCheck size={16} />
          2FA aktif
        </p>
        {error && <p className="font-data text-xs text-danger">{error}</p>}
        <Button
          variant="outline"
          size="sm"
          className="text-danger"
          disabled={busy}
          onClick={() => disable(factors[0].id)}
        >
          <ShieldOff size={14} />
          nonaktifkan 2FA
        </Button>
      </div>
    );
  }

  if (enrolling && qrCode) {
    return (
      <form onSubmit={confirmEnroll} className="max-w-sm space-y-4">
        <p className="font-data text-xs text-muted">
          scan QR ini pakai Google Authenticator / Authy, lalu masukkan kode 6 digitnya:
        </p>
        <img src={qrCode} alt="QR 2FA" width={180} height={180} className="rounded-md border border-line" />
        {secret && (
          <p className="font-data text-[11px] text-muted break-all">
            atau masukkan manual: <span className="text-text">{secret}</span>
          </p>
        )}
        <OtpInput value={code} onChange={setCode} length={6} />
        {error && <p className="font-data text-xs text-danger">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={busy || code.length < 6}>
            {busy ? "memverifikasi..." : "aktifkan 2FA"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEnrolling(false)}>
            batal
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="max-w-sm space-y-3">
      <p className="font-data text-xs text-muted">
        2FA belum aktif. Aktifkan buat lapisan keamanan tambahan pakai aplikasi authenticator.
      </p>
      {error && <p className="font-data text-xs text-danger">{error}</p>}
      <Button size="sm" onClick={startEnroll} disabled={busy}>
        <ShieldCheck size={14} />
        aktifkan 2FA
      </Button>
    </div>
  );
}
