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

type Step = "form" | "otp";

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>("form");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { user_name: username } },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("otp");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleResend() {
    setError(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setError(error.message);
      return;
    }
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  }

  if (step === "otp") {
    return (
      <TerminalCard command="fathir auth --verify-otp">
        <form onSubmit={handleVerify} className="space-y-5">
          <p className="text-center font-data text-xs text-muted">
            kode 6 digit sudah dikirim ke <span className="text-text">{email}</span>
          </p>
          <OtpInput value={otp} onChange={setOtp} />

          {error && (
            <p className="text-center font-data text-xs text-danger" role="alert">
              error: {error}
            </p>
          )}
          {resent && (
            <p className="text-center font-data text-xs text-signal">kode baru terkirim</p>
          )}

          <Button type="submit" disabled={loading || otp.length < 6} className="w-full">
            {loading ? "verifying..." : "verify & masuk"}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            className="w-full text-center font-data text-xs text-muted hover:text-accent"
          >
            kirim ulang kode
          </button>
        </form>
      </TerminalCard>
    );
  }

  return (
    <TerminalCard command="fathir auth --register">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            required
            minLength={3}
            pattern="[a-zA-Z0-9_]+"
            title="letters, numbers, underscore only"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="fathirsthore"
          />
        </div>
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="min. 8 characters"
          />
        </div>

        {error && (
          <p className="font-data text-xs text-danger" role="alert">
            error: {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "creating account..." : "run register"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs font-data text-muted">or continue with</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <OAuthButtons />

      <p className="mt-6 text-center text-xs font-data text-muted">
        already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          login
        </Link>
      </p>
    </TerminalCard>
  );
}
