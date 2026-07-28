"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { TerminalCard } from "@/components/auth/terminal-card";
import { OtpInput } from "@/components/auth/otp-input";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 2FA step-up, only shown if the account has a verified TOTP factor.
  const [needsMfa, setNeedsMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState("");

  async function completeLogin() {
    fetch("/api/account/log-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: needsMfa ? "password+2fa" : "password" }),
    }).catch(() => {});

    router.push(next || "/dashboard");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check if this account has 2FA enabled and the session still needs to
    // step up from aal1 to aal2 before it's considered fully authenticated.
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    setLoading(false);

    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== aal.nextLevel) {
      setNeedsMfa(true);
      return;
    }

    completeLogin();
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError || !factors?.totp?.[0]) {
      setLoading(false);
      setError(factorsError?.message ?? "2FA factor not found");
      return;
    }
    const factorId = factors.totp[0].id;

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setLoading(false);
      setError(challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: mfaCode,
    });

    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    completeLogin();
  }

  if (needsMfa) {
    return (
      <TerminalCard command="fathir auth --2fa">
        <form onSubmit={handleMfaSubmit} className="space-y-4">
          <p className="font-data text-xs text-muted">
            masukkan kode 6 digit dari aplikasi authenticator kamu
          </p>
          <OtpInput value={mfaCode} onChange={setMfaCode} length={6} />
          {error && (
            <p className="font-data text-xs text-danger" role="alert">
              error: {error}
            </p>
          )}
          <Button type="submit" disabled={loading || mfaCode.length < 6} className="w-full">
            {loading ? "memverifikasi..." : "verifikasi"}
          </Button>
        </form>
      </TerminalCard>
    );
  }

  return (
    <TerminalCard command="fathir auth --login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-data text-muted hover:text-accent mb-1.5"
            >
              forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="font-data text-xs text-danger" role="alert">
            error: {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "authenticating..." : "run login"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs font-data text-muted">or continue with</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <OAuthButtons next={next} />

      <p className="mt-6 text-center text-xs font-data text-muted">
        no account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          register
        </Link>
      </p>
    </TerminalCard>
  );
}
