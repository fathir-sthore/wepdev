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
        "bg-panel2/40 backdrop-blur-glass transition-all duration-200",
        "hover:border-accent/50 hover:shadow-glow"
      )}
    >
      <CardContent className="flex items-center gap-3">
        <div
          className={cn(
            "rounded-md p-2.5 border",
            accent === "purple"
              ? "bg-signal/10 border-signal/30 text-signal"
              : "bg-accent/10 border-accent/30 text-accent"
          )}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-stat text-xl text-text truncate">{value}</p>
          <p className="font-data text-[11px] text-muted uppercase tracking-wide truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
