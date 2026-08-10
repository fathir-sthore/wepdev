import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line",
        "bg-panel2/30 backdrop-blur-glass px-6 py-14 text-center",
        className
      )}
    >
      <div className="rounded-full border border-line bg-panel2 p-3 text-muted">
        <Icon size={22} />
      </div>
      <p className="text-title text-sm text-text">{title}</p>
      {description && (
        <p className="text-desc text-xs text-muted max-w-xs">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-1">
          <Button size="sm">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
