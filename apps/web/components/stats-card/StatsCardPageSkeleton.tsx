import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Skeleton className="h-4 w-72 max-w-full" />
      <div className="flex items-start gap-6 max-lg:flex-col">
        <Skeleton className="h-80 w-72 shrink-0 rounded-2xl max-lg:w-full" />
        <Skeleton className="h-80 min-w-0 flex-1 rounded-2xl" />
      </div>
    </div>
  );
}
