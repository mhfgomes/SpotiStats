"use client";

import { TasteRadar } from "@/components/stats/TasteRadar";
import { TimeRangeTabs } from "@/components/stats/TimeRangeTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpotifyTopData } from "@/hooks/useSpotifyTopData";
import { timeRangeLabel, useTimeRange } from "@/hooks/useTimeRange";
import { cn } from "@/lib/utils";

const AXIS_META: Record<string, { desc: string }> = {
  Energy: {
    desc: "Electronic, dance, hip-hop, metal — high-tempo and high-intensity music",
  },
  Acoustic: {
    desc: "Folk, singer-songwriter, classical — organic and unplugged sounds",
  },
  Mood: {
    desc: "Jazz, soul, R&B, lo-fi — emotionally rich and introspective listening",
  },
  Experimental: {
    desc: "Avant-garde, psychedelic, post-rock — unconventional and boundary-pushing",
  },
  Mainstream: {
    desc: "Pop, dance pop, chart hits — widely popular and commercially produced",
  },
  Underground: {
    desc: "Indie, alternative, shoegaze — niche genres and DIY scenes",
  },
};

const AXIS_ORDER = Object.keys(AXIS_META);

function TasteProfileSkeleton() {
  return (
    <div className="spotify-card flex flex-col gap-6 p-6 lg:flex-row">
      <div className="shrink-0 lg:w-1/2">
        <div className="relative h-[340px] w-full overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative size-60 rounded-full border border-white/10">
              <div className="absolute inset-5 rounded-full border border-white/10" />
              <div className="absolute inset-10 rounded-full border border-white/10" />
              <div className="absolute inset-[4.5rem] rounded-full border border-white/10" />
              <Skeleton className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-spotify-green/20" />
            </div>
          </div>

          <Skeleton className="absolute left-1/2 top-3 h-4 w-20 -translate-x-1/2 rounded-full" />
          <Skeleton className="absolute bottom-3 left-1/2 h-4 w-24 -translate-x-1/2 rounded-full" />
          <Skeleton className="absolute left-5 top-1/2 h-4 w-24 -translate-y-1/2 rounded-full" />
          <Skeleton className="absolute right-5 top-1/2 h-4 w-24 -translate-y-1/2 rounded-full" />
          <Skeleton className="absolute left-10 top-12 h-4 w-20 rounded-full" />
          <Skeleton className="absolute bottom-12 right-10 h-4 w-24 rounded-full" />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4">
        {AXIS_ORDER.map((axis, index) => (
          <div key={axis}>
            <div className="mb-1 flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <Skeleton
              className="mb-1.5 h-1.5 rounded-full"
              style={{ width: `${88 - index * 4}%` }}
            />
            <Skeleton className="h-3 w-full max-w-md rounded-full" />
            <Skeleton className="mt-1 h-3 w-4/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TasteProfilePage() {
  const { timeRange, setTimeRange, isPending } = useTimeRange();
  const { data, error, isLoading, isRefreshing } = useSpotifyTopData(timeRange);
  const profile = data?.tasteProfile ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-spotify-subtext">
          Based on your top artists&apos; genres over the {timeRangeLabel(timeRange)}
        </p>
        <TimeRangeTabs
          value={timeRange}
          onChange={setTimeRange}
          isPending={isPending || isRefreshing}
        />
      </div>

      {isLoading && !data ? (
        <TasteProfileSkeleton />
      ) : error && !data ? (
        <div className="spotify-card flex flex-col items-center justify-center p-6 py-16 text-center">
          <p className="text-sm text-spotify-subtext">Could not load taste profile.</p>
          <p className="mt-1 text-xs text-spotify-subtext">{error}</p>
        </div>
      ) : profile.length === 0 ? (
        <div className="spotify-card flex flex-col items-center justify-center p-6 py-16 text-center">
          <p className="text-sm text-spotify-subtext">No taste profile data yet.</p>
          <p className="mt-1 text-xs text-spotify-subtext">
            Spotify did not return enough artist genre data yet.
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "spotify-card flex flex-col gap-6 p-6 transition-opacity duration-200 lg:flex-row",
            isRefreshing && "pointer-events-none opacity-55"
          )}
          aria-busy={isRefreshing}
        >
          <div className="shrink-0 lg:w-1/2">
            <TasteRadar profile={profile} />
          </div>

          <div className="flex flex-1 flex-col justify-center gap-4">
            {profile.map(({ axis, value }) => (
              <div key={axis}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{axis}</span>
                  <span className="text-sm font-bold tabular-nums text-spotify-green">
                    {value}%
                  </span>
                </div>
                <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-spotify-green transition-all duration-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <p className="text-xs leading-snug text-spotify-subtext">
                  {AXIS_META[axis]?.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
