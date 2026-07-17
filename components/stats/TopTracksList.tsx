"use client";

import { TrackCard } from "./TrackCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeRange } from "@/types/spotify";
import { getRankChange } from "./RankChangeBadge";
import { useSpotifyTopData } from "@/hooks/useSpotifyTopData";
import { cn } from "@/lib/utils";

interface TopTracksListProps {
  timeRange: TimeRange;
}

function TopTracksListSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <div className="flex w-20 shrink-0 items-center gap-2">
            <Skeleton className="h-7 w-10 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-6 shrink-0" />
          </div>
          <Skeleton className="h-12 w-12 shrink-0 rounded" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="hidden h-3 w-28 shrink-0 md:block" />
          <div className="hidden w-24 shrink-0 items-center gap-2 lg:flex">
            <Skeleton className="h-1.5 flex-1 rounded-full" />
            <Skeleton className="h-3 w-5" />
          </div>
          <Skeleton className="hidden h-3 w-10 shrink-0 sm:block" />
        </div>
      ))}
    </div>
  );
}

export function TopTracksList({ timeRange }: TopTracksListProps) {
  const { data, error, isLoading, isRefreshing } = useSpotifyTopData(timeRange);
  const tracks = data?.tracks ?? [];

  if (isLoading && !data) {
    return <TopTracksListSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-spotify-subtext">Could not load top tracks.</p>
        <p className="mt-1 text-xs text-spotify-subtext">{error}</p>
      </div>
    );
  }

  if (tracks.length === 0 && !isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-spotify-subtext">No tracks found.</p>
        <p className="mt-1 text-xs text-spotify-subtext">
          Spotify did not return any top tracks for this range.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "divide-y divide-white/5 transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-55"
      )}
      aria-busy={isRefreshing}
    >
      {tracks.map((track) => {
        const previousRank = data?.hasComparisonSnapshot
          ? data.previousTrackRanks[track.trackSpotifyId] ?? null
          : undefined;

        return (
          <TrackCard
            key={track.trackSpotifyId}
            rank={track.rank}
            trackName={track.trackName}
            albumName={track.albumName}
            albumExternalUrl={track.albumExternalUrl}
            albumImageUrl={track.albumImageUrl}
            artistNames={track.artistNames}
            artistSpotifyIds={track.artistSpotifyIds}
            durationMs={track.durationMs}
            explicit={track.explicit}
            externalUrl={track.externalUrl}
            popularity={track.popularity}
            rankChange={getRankChange(track.rank, previousRank)}
            comparisonSnapshotSyncedAt={data?.previousTrackSnapshotSyncedAt}
          />
        );
      })}
    </div>
  );
}
