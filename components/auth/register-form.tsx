"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { TerminalCard } from "@/components/auth/terminal-card";

export function RegisterForm() {
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { user_name: username },
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <TerminalCard command="fathir auth --register">
        <p className="font-data text-sm text-signal">
          check your inbox — confirmation link sent to {email}
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
