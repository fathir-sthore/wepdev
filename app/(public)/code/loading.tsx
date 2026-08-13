import { Skeleton } from "@/components/ui/skeleton";

function SnippetCardSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-panel2 p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-3.5 w-2/3 mb-2" />
      <Skeleton className="h-2.5 w-full mb-1.5" />
      <Skeleton className="h-2.5 w-4/5 mb-4" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export default function CodeLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-9 w-full max-w-md mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SnippetCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
