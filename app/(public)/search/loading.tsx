import { ScriptCardSkeleton } from "@/components/public/script-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-9 w-full max-w-md mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ScriptCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
