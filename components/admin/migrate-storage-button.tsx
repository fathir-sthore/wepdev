"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

export function MigrateStorageButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/migrate-storage", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "migrasi gagal");
      setResult(data.summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <p className="font-data text-xs text-muted">
          Pindahkan file lama (masih di Supabase Storage) ke Cloudflare R2 dan
          update path-nya di database. Aman dijalankan berkali-kali — file
          yang sudah di R2 otomatis dilewati.
        </p>
        <Button size="sm" onClick={handleClick} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "memigrasikan..." : "migrasikan file lama ke R2"}
        </Button>

        {error && <p className="font-data text-xs text-danger">error: {error}</p>}

        {result && (
          <div className="font-data text-xs text-signal space-y-1">
            <p>✓ {result.scripts} script, {result.banners} banner, {result.avatars} avatar berhasil dipindah</p>
            {result.failed.length > 0 && (
              <div className="text-danger">
                <p>gagal ({result.failed.length}):</p>
                <ul className="list-disc list-inside">
                  {result.failed.map((f: string) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
