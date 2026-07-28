"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash } from "lucide-react";

export function LanguageSelect({ userId, initial }: { userId: string; initial: "id" | "en" }) {
  const router = useRouter();
  const supabase = createClient();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: "id" | "en") {
    setValue(next);
    setSaving(true);
    await supabase.from("profiles").update({ language_preference: next }).eq("id", userId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <Label>Bahasa</Label>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value as "id" | "en")}
        disabled={saving}
        className="h-9 rounded-md border border-line bg-panel2 px-3 text-sm font-data text-text"
      >
        <option value="id">Indonesia</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}

export function NotificationToggle({ userId, initial }: { userId: string; initial: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [checked, setChecked] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    const next = !checked;
    setChecked(next);
    setSaving(true);
    await supabase.from("profiles").update({ email_notifications: next }).eq("id", userId);
    setSaving(false);
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 font-data text-sm text-text">
      <input type="checkbox" checked={checked} disabled={saving} onChange={handleToggle} />
      Kirim notifikasi email (pembelian, update script favorit, dll)
    </label>
  );
}

export function ClearCacheButton() {
  const [cleared, setCleared] = useState(false);

  function handleClear() {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // storage may be unavailable (private mode etc) — non-fatal
    }
    setCleared(true);
    setTimeout(() => window.location.reload(), 600);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClear}>
      <Trash size={14} />
      {cleared ? "membersihkan..." : "bersihkan cache lokal"}
    </Button>
  );
}
