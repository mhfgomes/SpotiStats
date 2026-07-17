"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { getRecentlyPlayedHistory, type HistoryItem } from "@/app/(dashboard)/history/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPlayedAt } from "@/lib/utils";
import { QueryEmptyState, QueryErrorState } from "./QueryState";

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
  const [isRetrying, setIsRetrying] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setIsRetrying(true);
    setReloadToken((token) => token + 1);
  }, []);

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
      } finally {
        if (!cancelled) {
          setIsRetrying(false);
        }
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  if (history === null) {
    return <RecentlyPlayedSkeleton />;
  }

  if (error) {
    return (
      <QueryErrorState
        title="Could not load recent history."
        description={error}
        onRetry={refetch}
        isRetrying={isRetrying}
      />
    );
  }

  if (history.length === 0) {
    return (
      <QueryEmptyState
        title="No listening history yet."
        description="Play something on Spotify, then refresh to see it here."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {history.map((item) => (
        <div
          key={`${item.trackSpotifyId}-${item.playedAt}`}
          className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-white/5"
        >
          <a
            href={`https://open.spotify.com/album/${item.albumSpotifyId ?? ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative h-10 w-10 shrink-0 overflow-hidden rounded bg-spotify-card${!item.albumSpotifyId ? " pointer-events-none" : ""}`}
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
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xs text-spotify-subtext">♪</span>
              </div>
            )}
          </a>

          <a
            href={`https://open.spotify.com/track/${item.trackSpotifyId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 transition-colors hover:text-spotify-green"
          >
            <p className="truncate text-sm font-medium">{item.trackName}</p>
          </a>

          <div className="hidden min-w-0 flex-1 items-center gap-1 md:flex">
            <p className="truncate text-xs text-spotify-subtext">
              {item.artistNames.map((name, idx) => {
                const artistId = item.artistSpotifyIds[idx];
                return artistId ? (
                  <a
                    key={idx}
                    href={`https://open.spotify.com/artist/${artistId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-spotify-green"
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

          <div className="hidden min-w-0 flex-1 lg:block">
            {item.albumSpotifyId ? (
              <a
                href={`https://open.spotify.com/album/${item.albumSpotifyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-xs text-spotify-subtext transition-colors hover:text-spotify-green"
              >
                {item.albumName}
              </a>
            ) : (
              <p className="truncate text-xs text-spotify-subtext">{item.albumName}</p>
            )}
          </div>

          <span className="hidden shrink-0 text-xs text-spotify-subtext sm:block">
            {formatPlayedAt(item.playedAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
