"use client";

import { useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href }).catch(() => {});
    } else {
      handleCopy();
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
        {copied ? <Check size={14} /> : <Link2 size={14} />}
        {copied ? "copied" : "copy link"}
      </Button>
      <Button variant="outline" size="sm" onClick={handleShare} className="flex-1">
        <Share2 size={14} />
        share
      </Button>
    </div>
  );
}
