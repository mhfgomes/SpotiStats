"use client";

import { TimeRangeTabs } from "@/components/stats/TimeRangeTabs";
import { GenreBreakdown } from "@/components/stats/GenreBreakdown";
import { useTimeRange } from "@/hooks/useTimeRange";

export default function TopGenresPage() {
  const { timeRange, setTimeRange, isPending } = useTimeRange();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-spotify-subtext">
          Genre distribution built from your live Spotify top artists
        </p>
        <TimeRangeTabs
          value={timeRange}
          onChange={setTimeRange}
          isPending={isPending}
        />
      </div>

      <GenreBreakdown timeRange={timeRange} />
    </div>
  );
}
