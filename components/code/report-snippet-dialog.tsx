"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const REASONS = ["kode error/gak jalan", "malware/berbahaya", "plagiat/bukan karya sendiri", "deskripsi menyesatkan", "lainnya"];

export function ReportSnippetDialog({ snippetId }: { snippetId: string }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("code_snippet_reports").insert({
      snippet_id: snippetId,
      user_id: user?.id ?? null,
      reason,
      details: details || null,
    });

    fetch("/api/notify/snippet-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snippetId, reason, details: details || null }),
    }).catch(() => {});

    setLoading(false);
    setSent(true);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 font-data text-xs text-muted hover:text-danger">
        <Flag size={12} /> laporkan kode ini ke pemiliknya
      </button>
    );
  }

  if (sent) {
    return <p className="font-data text-xs text-signal">laporan terkirim ke pemilik kode, makasih</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border border-line rounded-md p-3">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full h-8 rounded-md border border-line bg-panel2 px-2 text-xs font-data text-text"
      >
        {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="detail (opsional)"
        rows={2}
        className="w-full rounded-md border border-line bg-panel2 px-2 py-1 text-xs font-data text-text"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>{loading ? "mengirim..." : "kirim laporan"}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>batal</Button>
      </div>
    </form>
  );
}
