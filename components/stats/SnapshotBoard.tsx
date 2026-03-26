"use client";

import Image from "next/image";
import { formatDuration } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TrackSnapshotItem {
  rank: number;
  trackSpotifyId: string;
  trackName: string;
  albumName: string;
  albumExternalUrl?: string;
  albumImageUrl?: string;
  artistNames: string[];
  artistSpotifyIds?: string[];
  durationMs?: number;
  popularity?: number;
  externalUrl?: string;
}

export interface ArtistSnapshotItem {
  rank: number;
  artistSpotifyId: string;
  artistName: string;
  imageUrl?: string;
  genres: string[];
}

export function formatSnapshotDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SnapshotPicker({
  value,
  onChange,
  snapshots,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  snapshots: Array<{ syncedAt: number }>;
  disabled?: boolean;
}) {
  return (
    <div className="shrink-0">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select snapshot" />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          <SelectItem value="now">Now</SelectItem>
          {snapshots.map((snapshot) => (
            <SelectItem key={snapshot.syncedAt} value={String(snapshot.syncedAt)}>
              {formatSnapshotDate(snapshot.syncedAt)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function TrackBoardSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-3">
          <Skeleton className="h-4 w-6 shrink-0" />
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="hidden h-3 w-28 shrink-0 md:block" />
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

export function ArtistBoardSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-3">
          <Skeleton className="h-4 w-6 shrink-0" />
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-3 w-40 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function SnapshotPopularity({
  popularity,
  isLoading,
}: {
  popularity?: number;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <>
        <Skeleton className="h-1 flex-1 rounded-full" />
        <Skeleton className="h-3 w-6 shrink-0" />
      </>
    );
  }

  if (typeof popularity !== "number") {
    return (
      <>
        <div className="flex-1 h-1 rounded-full bg-white/10" />
        <span className="w-6 text-right text-xs text-spotify-subtext">-</span>
      </>
    );
  }

  return (
    <>
      <div className="flex-1 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-spotify-green"
          style={{ width: `${popularity}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs text-spotify-subtext">
        {popularity}
      </span>
    </>
  );
}

export function TrackSnapshotBoard({
  items,
  isMetadataLoading = false,
}: {
  items: TrackSnapshotItem[];
  isMetadataLoading?: boolean;
}) {
  return (
    <div className="divide-y divide-white/5">
      {items.map((item) => {
        const trackHref =
          item.externalUrl ?? `https://open.spotify.com/track/${item.trackSpotifyId}`;
        const needsMetadata =
          typeof item.popularity !== "number" || typeof item.durationMs !== "number";
        const showMetadataSkeleton = isMetadataLoading && needsMetadata;

        return (
          <div
            key={`${item.rank}-${item.trackSpotifyId}`}
            className="flex items-center gap-4 p-3 transition-colors hover:bg-white/[0.03]"
          >
            <span className="w-6 shrink-0 text-right font-mono text-sm text-spotify-subtext">
              {item.rank}
            </span>
            <a
              href={trackHref}
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-white/[0.05]"
            >
              {item.albumImageUrl ? (
                <Image
                  src={item.albumImageUrl}
                  alt={item.albumName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-spotify-subtext">
                  ♪
                </div>
              )}
            </a>
            <div className="min-w-0 flex-1">
              <a
                href={trackHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm font-medium transition-colors hover:text-spotify-green"
              >
                {item.trackName}
              </a>
              <p className="truncate text-xs text-spotify-subtext">
                {item.artistNames.map((name, index) => (
                  <span key={`${item.trackSpotifyId}-${name}-${index}`}>
                    {index > 0 && ", "}
                    {item.artistSpotifyIds?.[index] ? (
                      <a
                        href={`https://open.spotify.com/artist/${item.artistSpotifyIds[index]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-spotify-green"
                      >
                        {name}
                      </a>
                    ) : (
                      name
                    )}
                  </span>
                ))}
              </p>
            </div>
            {item.albumExternalUrl ? (
              <a
                href={item.albumExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden w-40 shrink-0 truncate text-xs text-spotify-subtext transition-colors hover:text-spotify-green md:block"
              >
                {item.albumName}
              </a>
            ) : (
              <span className="hidden w-40 shrink-0 truncate text-xs text-spotify-subtext md:block">
                {item.albumName}
              </span>
            )}
            <div className="hidden w-24 shrink-0 items-center gap-2 lg:flex">
              <SnapshotPopularity
                popularity={item.popularity}
                isLoading={showMetadataSkeleton}
              />
            </div>
            <span className="hidden w-10 shrink-0 text-right text-xs text-spotify-subtext sm:block">
              {showMetadataSkeleton ? (
                <Skeleton className="ml-auto h-3 w-8" />
              ) : typeof item.durationMs === "number" ? (
                formatDuration(item.durationMs)
              ) : (
                "-"
              )}
            </span>
            <span className="w-5 shrink-0" />
         </div>
        );
      })}
    </div>
  );
}

export function ArtistSnapshotBoard({ items }: { items: ArtistSnapshotItem[] }) {
  return (
    <div className="divide-y divide-white/5">
      {items.map((item) => (
        <div
          key={`${item.rank}-${item.artistSpotifyId}`}
          className="flex items-center gap-4 p-3 transition-colors hover:bg-white/[0.03]"
        >
          <span className="w-6 shrink-0 text-right font-mono text-sm text-spotify-subtext">
            {item.rank}
          </span>
          <a
            href={`https://open.spotify.com/artist/${item.artistSpotifyId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/[0.05]"
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.artistName}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-spotify-subtext">
                ♪
              </div>
            )}
          </a>
          <div className="min-w-0 flex-1">
            <a
              href={`https://open.spotify.com/artist/${item.artistSpotifyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm font-medium transition-colors hover:text-spotify-green"
            >
              {item.artistName}
            </a>
          </div>
          <span className="flex-1 truncate text-xs text-spotify-subtext">
            {item.genres.slice(0, 3).join(" · ") || "No genres listed"}
          </span>
          <span className="w-5 shrink-0" />
        </div>
      ))}
    </div>
  );
}
