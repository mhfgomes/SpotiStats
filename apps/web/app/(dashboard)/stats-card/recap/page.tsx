import { Suspense } from "react";
import { RecapCardPage } from "@/components/stats-card/RecapCardPage";
import { StatsCardPageSkeleton } from "@/components/stats-card/StatsCardPageSkeleton";

export default function RecapPage() {
  return (
    <Suspense fallback={<StatsCardPageSkeleton />}>
      <RecapCardPage />
    </Suspense>
  );
}
