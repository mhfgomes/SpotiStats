"use client";

import { useTimeRange } from "@/hooks/useTimeRange";
import { TimeRangeTabs } from "@/components/stats/TimeRangeTabs";
import { TopArtistsList } from "@/components/stats/TopArtistsList";

export default function TopArtistsPage() {
  const { timeRange, setTimeRange } = useTimeRange("medium_term");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-spotify-subtext text-sm">
            Your most listened-to artists
          </p>
        </div>
        <TimeRangeTabs value={timeRange} onChange={setTimeRange} />
      </div>

      <div className="spotify-card">
        <div className="flex items-center gap-4 px-3 py-2 border-b border-white/5 text-xs text-spotify-subtext uppercase tracking-wider">
          <span className="w-6 text-right">#</span>
          <span className="w-12 shrink-0" />
          <span className="flex-1">Artist</span>
          <span className="flex-1">Genres</span>
          <span className="w-5" />
        </div>
        <TopArtistsList timeRange={timeRange} />
      </div>
    </div>
  );
}
