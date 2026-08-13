"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full border border-danger/40 bg-danger/10 p-4 mb-6 text-danger">
        <AlertTriangle size={32} />
      </div>

      <p className="font-data text-xs text-danger mb-2">$ fathir code --catch ./error</p>
      <h1 className="text-title text-2xl text-text mb-2">Ada yang salah</h1>
      <p className="text-desc text-sm text-muted max-w-sm mb-2">
        Terjadi error yang nggak terduga di server. Tim kami sudah otomatis dicatat.
      </p>
      {error.digest && (
        <p className="font-data text-[11px] text-muted mb-8">ref: {error.digest}</p>
      )}
      {!error.digest && <div className="mb-8" />}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw size={16} /> Coba lagi
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home size={16} /> Kembali ke home
          </Button>
        </Link>
      </div>
    </div>
  );
}
