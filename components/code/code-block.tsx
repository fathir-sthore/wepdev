"use client";

import { useEffect, useRef, useState } from "react";
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

// Maps our detected language ids to Prism's language identifiers.
const PRISM_LANG: Record<string, string> = {
  javascript: "javascript",
  python: "python",
  json: "json",
  dart: "dart",
  shell: "bash",
  html: "markup",
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
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      const Prism = (await import("prismjs")).default;
      // Core language dependencies, then the language we actually need.
      await import("prismjs/components/prism-clike" as any);
      await import("prismjs/components/prism-markup" as any);
      await import("prismjs/components/prism-javascript" as any);
      await import("prismjs/components/prism-python" as any);
      await import("prismjs/components/prism-json" as any);
      await import("prismjs/components/prism-bash" as any);
      await import("prismjs/components/prism-dart" as any);

      if (!cancelled && codeRef.current) {
        Prism.highlightElement(codeRef.current);
      }
    }

    highlight();
    return () => {
      cancelled = true;
    };
  }, [content, language]);

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

  const prismLang = PRISM_LANG[language] ?? "javascript";

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
      <pre className="overflow-x-auto p-4 text-xs bg-[#1e1e1e]">
        <code ref={codeRef} className={`language-${prismLang}`}>
          {content}
        </code>
      </pre>
    </div>
  );
}
