"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArtistCard } from "./ArtistCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeRange } from "@/types/spotify";

interface TopArtistsListProps {
  timeRange: TimeRange;
}

export function TopArtistsList({ timeRange }: TopArtistsListProps) {
  const artists = useQuery(api.artists.getTopArtists, { timeRange });

  if (artists === undefined) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="w-6 h-4" />
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

  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-spotify-subtext text-sm">No artists found.</p>
        <p className="text-spotify-subtext text-xs mt-1">
          Try syncing your data first.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {(artists as NonNullable<typeof artists>).map((artist) => (
        <ArtistCard
          key={artist._id}
          rank={artist.rank}
          artistName={artist.artistName}
          genres={artist.genres}
          imageUrl={artist.imageUrl}
          externalUrl={artist.externalUrl}
        />
      ))}
    </div>
  );
}
