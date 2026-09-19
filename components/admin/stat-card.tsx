import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "cyan",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: "cyan" | "purple";
}) {
  return (
    <Card
      className={cn(
        "bg-panel2 transition-colors",
        "hover:border-accent/50"
      )}
    >
      <CardContent className="flex items-center gap-2 p-3 sm:p-4">
        <div
          className={cn(
            "shrink-0 rounded-md p-2 border",
            accent === "purple"
              ? "bg-signal/10 border-signal/30 text-signal"
              : "bg-accent/10 border-accent/30 text-accent"
          )}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-stat text-base sm:text-xl text-text leading-tight truncate">
            {value}
          </p>
          <p className="text-[11px] sm:text-xs text-muted leading-snug">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
