"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function DeleteSnippetButton({ snippetId, title }: { snippetId: string; title: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await supabase.from("code_snippets").delete().eq("id", snippetId);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="font-data text-[11px] text-danger">hapus "{title}"?</span>
        <Button size="sm" variant="ghost" className="text-danger" onClick={handleDelete} disabled={loading}>
          {loading ? "..." : "ya"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>batal</Button>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="sm" className="text-danger" onClick={() => setConfirming(true)}>
      hapus
    </Button>
  );
}
