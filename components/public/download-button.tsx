"use client";

import { useState } from "react";
import { Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DownloadButton({
  scriptId,
  passwordProtected,
}: {
  scriptId: string;
  passwordProtected?: boolean;
}) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!passwordProtected) {
    return (
      <a href={`/api/scripts/${scriptId}/download`}>
        <Button size="lg" className="w-full">
          <Download size={16} />
          Download
        </Button>
      </a>
    );
  }

  function handleDownload() {
    if (!password.trim()) {
      setError("masukkan password dulu");
      return;
    }
    setError(null);
    window.location.href = `/api/scripts/${scriptId}/download?password=${encodeURIComponent(password)}`;
  }

  if (!showPrompt) {
    return (
      <Button size="lg" className="w-full" onClick={() => setShowPrompt(true)}>
        <Lock size={16} />
        Download (perlu password)
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="masukkan password ZIP"
        autoFocus
      />
      {error && <p className="font-data text-xs text-danger">{error}</p>}
      <Button size="lg" className="w-full" onClick={handleDownload}>
        <Download size={16} />
        Konfirmasi &amp; Download
      </Button>
    </div>
  );
}
