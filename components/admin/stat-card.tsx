import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="rounded-md bg-panel2 p-2">
          <Icon size={18} className="text-accent" />
        </div>
        <div>
          <p className="text-stat text-xl text-text">{value}</p>
          <p className="font-data text-[11px] text-muted uppercase tracking-wide">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
