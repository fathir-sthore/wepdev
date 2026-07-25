"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function DeleteScriptButton({ scriptId, title }: { scriptId: string; title: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await supabase.from("scripts").delete().eq("id", scriptId);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="font-data text-[11px] text-danger">delete "{title}"?</span>
        <Button size="sm" variant="ghost" className="text-danger" onClick={handleDelete} disabled={loading}>
          {loading ? "..." : "yes"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>no</Button>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="sm" className="text-danger" onClick={() => setConfirming(true)}>
      delete
    </Button>
  );
}
