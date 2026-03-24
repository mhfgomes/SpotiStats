"use client";

import Link from "next/link";
import { useTimeRange } from "@/hooks/useTimeRange";
import { TimeRangeTabs } from "@/components/stats/TimeRangeTabs";
import { TopTracksList } from "@/components/stats/TopTracksList";
import { Button } from "@/components/ui/button";

export default function TopTracksPage() {
  const { timeRange, setTimeRange, isPending } = useTimeRange();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-spotify-subtext text-sm">
            Your most listened-to tracks, fetched live from Spotify
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={`/top-tracks/history?term=${timeRange}`}>
              View History
            </Link>
          </Button>
          <TimeRangeTabs value={timeRange} onChange={setTimeRange} isPending={isPending} />
        </div>
      </div>

      <div className="spotify-card">
        {/* Table header */}
        <div className="flex items-center gap-4 px-3 py-2 border-b border-white/5 text-xs text-spotify-subtext uppercase tracking-wider">
          <span className="w-12 shrink-0 flex items-center gap-2">
            <span className="w-4" />
            <span className="w-6 text-right">#</span>
          </span>
          <span className="w-12 shrink-0" />
          <span className="flex-1">Title</span>
          <span className="hidden md:block w-40">Album</span>
          <span className="hidden lg:block w-24">Popularity</span>
          <span className="hidden sm:block w-10">Time</span>
          <span className="w-5" />
        </div>
        <TopTracksList timeRange={timeRange} />
      </div>
    </div>
  );
}
