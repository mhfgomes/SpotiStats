import { Suspense } from "react";
import { NowPlayingCardPage } from "@/components/stats-card/NowPlayingCardPage";
import { StatsCardPageSkeleton } from "@/components/stats-card/StatsCardPageSkeleton";

export default function NowPlayingPage() {
  return (
    <Suspense fallback={<StatsCardPageSkeleton />}>
      <NowPlayingCardPage />
    </Suspense>
  );
}
