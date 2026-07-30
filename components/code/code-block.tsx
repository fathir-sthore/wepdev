"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXT_MAP: Record<string, string> = {
  javascript: "js",
  python: "py",
  json: "json",
  dart: "dart",
  shell: "sh",
  html: "html",
};

export function CodeBlock({
  content,
  language,
  fileName,
}: {
  content: string;
  language: string;
  fileName?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    const ext = EXT_MAP[language] ?? "txt";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || `snippet.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-md border border-line overflow-hidden">
      <div className="flex items-center justify-between bg-panel2 px-3 py-2 border-b border-line">
        <span className="font-data text-[11px] text-muted">{fileName || "code"}</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "disalin" : "salin"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download size={13} />
            download
          </Button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-xs font-data text-text bg-ink">
        <code>{content}</code>
      </pre>
    </div>
  );
}
