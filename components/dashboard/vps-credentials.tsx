"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, Check } from "lucide-react";

export function VpsCredentials({
  ipAddress,
  port,
  username,
  password,
  meta,
}: {
  ipAddress: string;
  port: number;
  username: string;
  password: string;
  meta: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  async function copy(field: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // clipboard API unavailable — nothing we can do silently
    }
  }

  return (
    <div className="rounded-lg border border-line bg-panel2 p-3 grid gap-1.5 text-xs">
      <Row label="IP" value={`${ipAddress}:${port}`} onCopy={() => copy("ip", `${ipAddress}:${port}`)} copied={copiedField === "ip"} />
      <Row label="Username" value={username} onCopy={() => copy("username", username)} copied={copiedField === "username"} />
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted">Password</span>
        <span className="flex items-center gap-1.5 text-text select-text">
          <span className="font-mono">{showPassword ? password : "•".repeat(Math.min(password.length, 12))}</span>
          <button onClick={() => setShowPassword((v) => !v)} className="text-muted hover:text-text">
            {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button onClick={() => copy("password", password)} className="text-muted hover:text-text">
            {copiedField === "password" ? <Check size={13} className="text-free" /> : <Copy size={13} />}
          </button>
        </span>
      </div>
      <p className="text-muted mt-1">{meta}</p>
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className="flex items-center gap-1.5 text-text select-text">
        <span className="font-mono">{value}</span>
        <button onClick={onCopy} className="text-muted hover:text-text">
          {copied ? <Check size={13} className="text-free" /> : <Copy size={13} />}
        </button>
      </span>
    </div>
  );
}
