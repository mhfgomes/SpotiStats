"use client";

import { ArtistCard } from "./ArtistCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeRange } from "@/types/spotify";
import { getRankChange } from "./RankChangeBadge";
import { useSpotifyTopData } from "@/hooks/useSpotifyTopData";
import { cn } from "@/lib/utils";

interface TopArtistsListProps {
  timeRange: TimeRange;
}

function TopArtistsListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <div className="flex w-20 shrink-0 items-center gap-2">
            <Skeleton className="h-7 w-10 rounded-full" />
            <Skeleton className="h-4 w-6" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TopArtistsList({ timeRange }: TopArtistsListProps) {
  const { data, error, isLoading, isRefreshing } = useSpotifyTopData(timeRange);
  const artists = data?.artists ?? [];

  if (isLoading && !data) {
    return <TopArtistsListSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-spotify-subtext">Could not load top artists.</p>
        <p className="mt-1 text-xs text-spotify-subtext">{error}</p>
      </div>
    );
  }

  if (artists.length === 0 && !isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-spotify-subtext">No artists found.</p>
        <p className="mt-1 text-xs text-spotify-subtext">
          Spotify did not return any top artists for this range.
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
      {artists.map((artist) => {
        const previousRank = data?.hasComparisonSnapshot
          ? data.previousArtistRanks[artist.artistSpotifyId] ?? null
          : undefined;

        return (
          <ArtistCard
            key={artist.artistSpotifyId}
            rank={artist.rank}
            artistName={artist.artistName}
            genres={artist.genres}
            imageUrl={artist.imageUrl}
            externalUrl={artist.externalUrl}
            rankChange={getRankChange(artist.rank, previousRank)}
            comparisonSnapshotSyncedAt={data?.previousArtistSnapshotSyncedAt}
          />
        );
      })}
    </div>
  );
}
