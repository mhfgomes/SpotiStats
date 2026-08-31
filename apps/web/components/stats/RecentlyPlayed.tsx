"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getRecentlyPlayedHistory, type HistoryItem } from "@/app/(dashboard)/history/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPlayedAt } from "@/lib/utils";

function RecentlyPlayedSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-28 md:block" />
          <Skeleton className="hidden h-4 w-28 lg:block" />
          <Skeleton className="hidden h-3 w-20 sm:block" />
        </div>
      ))}
    </div>
  );
}

export function RecentlyPlayed() {
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const result = await getRecentlyPlayedHistory(100);
        if (cancelled) {
          return;
        }

        setHistory(result.items);
        setError(result.error);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setHistory([]);
        setError(
          err instanceof Error ? err.message : "Failed to load listening history."
        );
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  if (history === null) {
    return <RecentlyPlayedSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-spotify-subtext text-sm">Could not load recent history.</p>
        <p className="text-spotify-subtext text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-spotify-subtext text-sm">No listening history yet.</p>
        <p className="text-spotify-subtext text-xs mt-1">
          Spotify has not returned any recently played tracks yet.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {history.map((item) => (
        <div
          key={`${item.trackSpotifyId}-${item.playedAt}`}
          className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors rounded-xl"
        >
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

          <a
            href={`https://open.spotify.com/track/${item.trackSpotifyId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 hover:text-spotify-green transition-colors"
          >
            <p className="text-sm font-medium truncate">{item.trackName}</p>
          </a>

          <div className="hidden md:flex items-center gap-1 flex-1 min-w-0">
            <p className="text-xs text-spotify-subtext truncate">
              {item.artistNames.map((name, idx) => {
                const artistId = item.artistSpotifyIds[idx];
                return artistId ? (
                  <a
                    key={idx}
                    href={`https://open.spotify.com/artist/${artistId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-spotify-green transition-colors"
                  >
                    {name}
                    {idx < item.artistNames.length - 1 ? ", " : ""}
                  </a>
                ) : (
                  <span key={idx}>
                    {name}
                    {idx < item.artistNames.length - 1 ? ", " : ""}
                  </span>
                );
              })}
            </p>
          </div>

          <div className="hidden lg:block flex-1 min-w-0">
            {item.albumSpotifyId ? (
              <a
                href={`https://open.spotify.com/album/${item.albumSpotifyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-spotify-subtext truncate block hover:text-spotify-green transition-colors"
              >
                {item.albumName}
              </a>
            ) : (
              <p className="text-xs text-spotify-subtext truncate">{item.albumName}</p>
            )}
          </div>

          <span className="text-xs text-spotify-subtext shrink-0 hidden sm:block">
            {formatPlayedAt(item.playedAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
