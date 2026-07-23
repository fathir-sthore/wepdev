import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function TerminalCard({
  command,
  children,
  className,
}: {
  command: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("w-full max-w-md shadow-glow overflow-hidden", className)}>
      <div className="flex items-center gap-2 border-b border-line bg-panel2 px-4 py-3">
        <span className="term-dot bg-danger/70" />
        <span className="term-dot bg-accent/70" />
        <span className="term-dot bg-signal/70" />
        <span className="ml-3 font-data text-xs text-muted truncate">
          {command}
        </span>
      </div>
      <div className="p-6">
        <p className="mb-6 font-data text-xs text-signal">
          $ {command}
          <span className="inline-block w-2 h-3 bg-signal ml-1 align-middle animate-caret" />
        </p>
        {children}
      </div>
    </Card>
  );
}
