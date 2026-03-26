"use client";

import { TrackCard } from "./TrackCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeRange } from "@/types/spotify";
import { getRankChange } from "./RankChangeBadge";
import { useSpotifyTopData } from "@/hooks/useSpotifyTopData";

interface TopTracksListProps {
  timeRange: TimeRange;
}

function TopTracksListSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <div className="flex w-20 shrink-0 items-center gap-2">
            <Skeleton className="w-10 h-7 shrink-0 rounded-full" />
            <Skeleton className="w-6 h-4 shrink-0" />
          </div>
          <Skeleton className="w-12 h-12 rounded shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="hidden md:block h-3 w-28 shrink-0" />
          <div className="hidden lg:flex items-center gap-2 w-24 shrink-0">
            <Skeleton className="flex-1 h-1.5 rounded-full" />
            <Skeleton className="w-5 h-3" />
          </div>
          <Skeleton className="hidden sm:block h-3 w-10 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function TopTracksList({ timeRange }: TopTracksListProps) {
  const { data, error, isLoading, isRefreshing } = useSpotifyTopData(timeRange);
  const tracks = data?.tracks ?? [];

  if (isLoading || isRefreshing) {
    return <TopTracksListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-spotify-subtext text-sm">Could not load top tracks.</p>
        <p className="text-spotify-subtext text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-spotify-subtext text-sm">No tracks found.</p>
        <p className="text-spotify-subtext text-xs mt-1">Spotify did not return any top tracks for this range.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
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
