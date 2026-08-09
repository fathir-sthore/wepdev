"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/auth/otp-input";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

type Step = "request" | "reset";

export function ForgotPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("reset");
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery",
    });

    if (verifyError) {
      setLoading(false);
      setError(verifyError.message);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    fetch("/api/account/log-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "password_reset" }),
    }).catch(() => {});

    router.push("/dashboard");
    router.refresh();
  }

  if (step === "reset") {
    return (
      <AuthSplitLayout
        imageSrc="/auth-reset-password.png"
        imageAlt="Reset password Fathir Code"
        eyebrow="atur ulang password"
        title="Hampir selesai."
        subtitle="Masukkan kode dari email dan password baru kamu."
      >
        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <h1 className="text-title text-2xl font-bold text-text">Masukkan kode</h1>
            <p className="mt-1 text-sm text-muted">
              kode dikirim ke <span className="text-text">{email}</span>
            </p>
          </div>

          <OtpInput value={otp} onChange={setOtp} length={8} />

          <div>
            <Label htmlFor="new_password">Password baru</Label>
            <Input
              id="new_password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="min. 8 characters"
            />
          </div>

          {error && (
            <p className="font-display text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading || otp.length < 8} className="w-full font-display">
            {loading ? "memperbarui..." : "Verifikasi & perbarui password"}
          </Button>
        </form>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      imageSrc="/auth-reset-password.png"
      imageAlt="Lupa password Fathir Code"
      eyebrow="lupa password?"
      title="Gak masalah, kita bantu."
      subtitle="Masukkan email kamu, kami kirim kode buat atur ulang password."
    >
      <div className="mb-8">
        <h1 className="text-title text-2xl font-bold text-text">Lupa password</h1>
        <p className="mt-1 text-sm text-muted">
          <Link href="/login" className="text-accent hover:underline">
            kembali ke login
          </Link>
        </p>
      </div>

      <form onSubmit={handleRequest} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        {error && (
          <p className="font-display text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full font-display">
          {loading ? "mengirim..." : "Kirim kode OTP"}
        </Button>
      </form>
    </AuthSplitLayout>
  );
}
