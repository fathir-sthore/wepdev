"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TerminalCard } from "@/components/auth/terminal-card";
import { OtpInput } from "@/components/auth/otp-input";

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

    router.push("/dashboard");
    router.refresh();
  }

  if (step === "reset") {
    return (
      <TerminalCard command="fathir auth --reset-password">
        <form onSubmit={handleReset} className="space-y-5">
          <p className="text-center font-data text-xs text-muted">
            kode 6 digit sudah dikirim ke <span className="text-text">{email}</span>
          </p>
          <OtpInput value={otp} onChange={setOtp} />

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
            <p className="font-data text-xs text-danger" role="alert">
              error: {error}
            </p>
          )}

          <Button type="submit" disabled={loading || otp.length < 6} className="w-full">
            {loading ? "updating..." : "verify & update password"}
          </Button>
        </form>
      </TerminalCard>
    );
  }

  return (
    <TerminalCard command="fathir auth --reset-password">
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
          <p className="font-data text-xs text-danger" role="alert">
            error: {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "sending..." : "send otp code"}
        </Button>
      </form>
      <p className="mt-6 text-center text-xs font-data text-muted">
        <Link href="/login" className="text-accent hover:underline">
          back to login
        </Link>
      </p>
    </TerminalCard>
  );
}
