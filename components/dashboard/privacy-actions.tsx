"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportDataButton() {
  return (
    <a href="/api/account/export">
      <Button variant="outline" size="sm">
        <Download size={14} />
        export data saya (JSON)
      </Button>
    </a>
  );
}

export function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/account/delete", { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "gagal menghapus akun");
      return;
    }
    router.push("/");
    router.refresh();
  }

  if (!confirming) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-danger border-danger/40"
        onClick={() => setConfirming(true)}
      >
        <Trash2 size={14} />
        hapus akun
      </Button>
    );
  }

  return (
    <div className="max-w-sm space-y-3 rounded-md border border-danger/40 p-4">
      <p className="font-data text-xs text-danger">
        ini permanen dan tidak bisa dibatalkan. Semua script, pembelian, dan data kamu akan
        terhapus. Ketik <span className="text-text">HAPUS</span> untuk konfirmasi.
      </p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        className="w-full h-9 rounded-md border border-line bg-panel2 px-3 text-sm font-data text-text"
        placeholder="HAPUS"
      />
      {error && <p className="font-data text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-danger text-white hover:bg-danger/90"
          disabled={confirmText !== "HAPUS" || loading}
          onClick={handleDelete}
        >
          {loading ? "menghapus..." : "hapus permanen"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          batal
        </Button>
      </div>
    </div>
  );
}
