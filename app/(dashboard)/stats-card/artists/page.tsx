import { Suspense } from "react";
import { BannerCardPage } from "@/components/stats-card/BannerCardPage";
import { StatsCardPageSkeleton } from "@/components/stats-card/StatsCardPageSkeleton";

export default function ArtistsCardPage() {
  return (
    <Suspense fallback={<StatsCardPageSkeleton />}>
      <BannerCardPage type="artists" />
    </Suspense>
  );
}
