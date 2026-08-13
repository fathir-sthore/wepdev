import { Skeleton } from "@/components/ui/skeleton";

export function ScriptCardSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-panel2 overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none border-0" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-2.5 w-1/2" />
        <Skeleton className="h-8 w-full mt-3" />
      </div>
    </div>
  );
}
