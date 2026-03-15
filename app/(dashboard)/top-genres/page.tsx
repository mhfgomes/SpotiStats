"use client";

import { useTimeRange } from "@/hooks/useTimeRange";
import { TimeRangeTabs } from "@/components/stats/TimeRangeTabs";
import { GenreBreakdown } from "@/components/stats/GenreBreakdown";

export default function TopGenresPage() {
  const { timeRange, setTimeRange } = useTimeRange();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-spotify-subtext text-sm">
            Genre distribution built from your live Spotify top artists
          </p>
        </div>
        <TimeRangeTabs value={timeRange} onChange={setTimeRange} />
      </div>

      <div className="spotify-card p-6">
        <GenreBreakdown timeRange={timeRange} />
      </div>
    </div>
  );
}
