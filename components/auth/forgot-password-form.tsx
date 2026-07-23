"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TerminalCard } from "@/components/auth/terminal-card";

export function ForgotPasswordForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <TerminalCard command="fathir auth --reset-password">
        <p className="font-data text-sm text-signal">
          reset link sent to {email}, if an account exists
        </p>
        <p className="mt-4 text-xs font-data text-muted">
          <Link href="/login" className="text-accent hover:underline">
            back to login
          </Link>
        </p>
      </TerminalCard>
    );
  }

  return (
    <TerminalCard command="fathir auth --reset-password">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          {loading ? "sending..." : "send reset link"}
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
