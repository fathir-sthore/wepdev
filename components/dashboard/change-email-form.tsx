"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/auth/otp-input";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("otp");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email: newEmail,
      token: otp,
      type: "email_change",
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerify} className="space-y-3 max-w-sm">
        <p className="font-data text-xs text-muted">
          kode dikirim ke <span className="text-text">{newEmail}</span>
        </p>
        <OtpInput value={otp} onChange={setOtp} length={8} />
        {error && <p className="font-data text-xs text-danger">{error}</p>}
        <Button type="submit" size="sm" disabled={loading || otp.length < 8}>
          {loading ? "memverifikasi..." : "verifikasi email baru"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequest} className="space-y-3 max-w-sm">
      <div>
        <Label>Email saat ini</Label>
        <p className="font-data text-sm text-muted">{currentEmail}</p>
      </div>
      <div>
        <Label htmlFor="new_email">Email baru</Label>
        <Input
          id="new_email"
          type="email"
          required
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="email-baru@example.com"
        />
      </div>
      {error && <p className="font-data text-xs text-danger">{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "mengirim..." : "kirim kode verifikasi"}
      </Button>
    </form>
  );
}
