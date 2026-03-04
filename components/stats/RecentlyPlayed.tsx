"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPlayedAt } from "@/lib/utils";

export function RecentlyPlayed() {
  const history = useQuery(api.history.getRecentlyPlayed, { limit: 100 });

  if (history === undefined) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="w-10 h-10 rounded shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-28 hidden md:block" />
            <Skeleton className="h-4 w-28 hidden lg:block" />
            <Skeleton className="h-3 w-20 hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-spotify-subtext text-sm">No listening history yet.</p>
        <p className="text-spotify-subtext text-xs mt-1">
          Sync your data to see your recently played tracks.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {(history as NonNullable<typeof history>).map((item) => (
        <div
          key={`${item.trackSpotifyId}-${item.playedAt}`}
          className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors rounded-xl"
        >
          {/* Album art */}
          <a
            href={`https://open.spotify.com/album/${item.albumSpotifyId ?? ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative w-10 h-10 rounded overflow-hidden shrink-0 bg-spotify-card${!item.albumSpotifyId ? " pointer-events-none" : ""}`}
          >
            {item.albumImageUrl ? (
              <Image
                src={item.albumImageUrl}
                alt={item.albumName}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs text-spotify-subtext">♪</span>
              </div>
            )}
          </a>

          {/* Track name */}
          <a
            href={`https://open.spotify.com/track/${item.trackSpotifyId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 hover:underline"
          >
            <p className="text-sm font-medium truncate">{item.trackName}</p>
          </a>

          {/* Artists */}
          <div className="hidden md:flex items-center gap-1 w-40 shrink-0 min-w-0">
            <p className="text-xs text-spotify-subtext truncate">
              {item.artistNames.map((name, idx) => {
                const artistId = item.artistSpotifyIds?.[idx];
                return artistId ? (
                  <a
                    key={idx}
                    href={`https://open.spotify.com/artist/${artistId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline transition-colors"
                  >
                    {name}{idx < item.artistNames.length - 1 ? ", " : ""}
                  </a>
                ) : (
                  <span key={idx}>
                    {name}{idx < item.artistNames.length - 1 ? ", " : ""}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Album */}
          <div className="hidden lg:block w-40 shrink-0 min-w-0">
            {item.albumSpotifyId ? (
              <a
                href={`https://open.spotify.com/album/${item.albumSpotifyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-spotify-subtext truncate block hover:text-white hover:underline transition-colors"
              >
                {item.albumName}
              </a>
            ) : (
              <p className="text-xs text-spotify-subtext truncate">{item.albumName}</p>
            )}
          </div>

          {/* Played at */}
          <span className="text-xs text-spotify-subtext shrink-0 hidden sm:block">
            {formatPlayedAt(item.playedAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
