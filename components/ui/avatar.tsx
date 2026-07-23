import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Avatar({
  src,
  alt,
  fallback,
  size = 40,
  className,
}: {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border border-line bg-panel2 flex items-center justify-center text-accent font-mono",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>{fallback.slice(0, 1).toUpperCase()}</span>
      )}
    </div>
  );
}
