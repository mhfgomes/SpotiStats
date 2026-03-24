"use client";

import { ArtistCard } from "./ArtistCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeRange } from "@/types/spotify";
import { getRankChange } from "./RankChangeBadge";
import { useSpotifyTopData } from "@/hooks/useSpotifyTopData";

interface TopArtistsListProps {
  timeRange: TimeRange;
}

function TopArtistsListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <div className="flex w-12 shrink-0 items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="w-6 h-4" />
          </div>
          <Skeleton className="w-12 h-12 rounded-full" />
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

  if (isLoading || isRefreshing) {
    return <TopArtistsListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-spotify-subtext text-sm">Could not load top artists.</p>
        <p className="text-spotify-subtext text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-spotify-subtext text-sm">No artists found.</p>
        <p className="text-spotify-subtext text-xs mt-1">Spotify did not return any top artists for this range.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
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
          />
        );
      })}
    </div>
  );
}
