import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AuthCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("w-full max-w-md overflow-hidden", className)}>
      <div className="p-6">
        <h1 className="text-title text-xl text-text mb-6">{title}</h1>
        {children}
      </div>
    </Card>
  );
}
