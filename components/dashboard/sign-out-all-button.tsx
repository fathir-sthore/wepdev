"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutAllDevicesButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await supabase.auth.signOut({ scope: "global" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading} className="text-danger">
      <LogOut size={14} />
      {loading ? "keluar..." : "keluar dari semua perangkat"}
    </Button>
  );
}
