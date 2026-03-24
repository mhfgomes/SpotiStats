"use client";

import Link from "next/link";
import { useTimeRange } from "@/hooks/useTimeRange";
import { TimeRangeTabs } from "@/components/stats/TimeRangeTabs";
import { GenreBreakdown } from "@/components/stats/GenreBreakdown";
import { Button } from "@/components/ui/button";

export default function TopGenresPage() {
  const { timeRange, setTimeRange, isPending } = useTimeRange();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-spotify-subtext text-sm">
            Genre distribution built from your live Spotify top artists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={`/top-genres/history?term=${timeRange}`}>
              View History
            </Link>
          </Button>
          <TimeRangeTabs value={timeRange} onChange={setTimeRange} isPending={isPending} />
        </div>
      </div>

      <div className="spotify-card p-6">
        <GenreBreakdown timeRange={timeRange} />
      </div>
    </div>
  );
}
