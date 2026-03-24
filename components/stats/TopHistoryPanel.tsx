"use client";

import { useQuery } from "convex/react";
import { Clock3, History, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimeRangeLabel } from "@/lib/utils";
import type { TimeRange } from "@/types/spotify";

type HistoryPanelKind = "tracks" | "artists" | "genres";

interface TrackHistoryItem {
  rank: number;
  trackSpotifyId: string;
  trackName: string;
  albumName: string;
  albumImageUrl?: string;
  artistNames: string[];
}

interface ArtistHistoryItem {
  rank: number;
  artistSpotifyId: string;
  artistName: string;
  imageUrl?: string;
  genres: string[];
}

interface GenreHistoryItem {
  rank: number;
  genre: string;
  count: number;
}

type SnapshotGroup<T> = {
  syncedAt: number;
  items: T[];
};

interface TopHistoryPanelProps {
  kind: HistoryPanelKind;
  timeRange: TimeRange;
}

function formatSnapshotDate(timestamp: number) {
  return new Date(timestamp).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeSnapshotDate(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatSnapshotDate(timestamp);
}

function getKindLabel(kind: HistoryPanelKind) {
  switch (kind) {
    case "tracks":
      return "Top Tracks";
    case "artists":
      return "Top Artists";
    case "genres":
      return "Top Genres";
  }
}

function HistoryPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-10 w-10 rounded-2xl" />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-white/8 bg-white/[0.03] p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((__, itemIndex) => (
              <div
                key={itemIndex}
                className="flex items-center gap-3 rounded-2xl border border-white/5 px-3 py-3"
              >
                <Skeleton className="h-8 w-8 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 max-w-full" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SnapshotShell({
  syncedAt,
  itemCount,
  noun,
  children,
}: {
  syncedAt: number;
  itemCount: number;
  noun: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent">
      <div className="flex items-start justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-spotify-subtext">
            Snapshot
          </p>
          <p className="mt-1 text-base font-semibold">{formatSnapshotDate(syncedAt)}</p>
          <p className="mt-1 text-xs text-spotify-subtext">
            Captured {formatRelativeSnapshotDate(syncedAt)}
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-spotify-subtext">
          {itemCount} {noun}
        </div>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function TracksHistoryView({
  snapshots,
}: {
  snapshots: SnapshotGroup<TrackHistoryItem>[];
}) {
  return (
    <div className="space-y-4">
      {snapshots.map((snapshot) => (
        <SnapshotShell
          key={snapshot.syncedAt}
          syncedAt={snapshot.syncedAt}
          itemCount={snapshot.items.length}
          noun="tracks"
        >
          <div className="space-y-2">
            {snapshot.items.slice(0, 5).map((item) => (
              <div
                key={`${snapshot.syncedAt}-${item.trackSpotifyId}`}
                className="flex items-center gap-3 rounded-2xl border border-white/6 bg-black/10 px-3 py-3 transition-colors hover:bg-white/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-semibold text-white">
                  {item.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={`https://open.spotify.com/track/${item.trackSpotifyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium hover:text-spotify-green transition-colors"
                  >
                    {item.trackName}
                  </a>
                  <p className="truncate text-xs text-spotify-subtext">
                    {item.artistNames.join(", ")}
                  </p>
                </div>
                <span className="hidden max-w-40 truncate rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] text-spotify-subtext md:block">
                  {item.albumName}
                </span>
              </div>
            ))}
          </div>
        </SnapshotShell>
      ))}
    </div>
  );
}

function ArtistsHistoryView({
  snapshots,
}: {
  snapshots: SnapshotGroup<ArtistHistoryItem>[];
}) {
  return (
    <div className="space-y-4">
      {snapshots.map((snapshot) => (
        <SnapshotShell
          key={snapshot.syncedAt}
          syncedAt={snapshot.syncedAt}
          itemCount={snapshot.items.length}
          noun="artists"
        >
          <div className="space-y-2">
            {snapshot.items.slice(0, 5).map((item) => (
              <div
                key={`${snapshot.syncedAt}-${item.artistSpotifyId}`}
                className="flex items-center gap-3 rounded-2xl border border-white/6 bg-black/10 px-3 py-3 transition-colors hover:bg-white/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-semibold text-white">
                  {item.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={`https://open.spotify.com/artist/${item.artistSpotifyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium hover:text-spotify-green transition-colors"
                  >
                    {item.artistName}
                  </a>
                </div>
                <span className="hidden max-w-52 truncate rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] text-spotify-subtext md:block">
                  {item.genres.slice(0, 3).join(" · ") || "No genres listed"}
                </span>
              </div>
            ))}
          </div>
        </SnapshotShell>
      ))}
    </div>
  );
}

function GenresHistoryView({
  snapshots,
}: {
  snapshots: SnapshotGroup<GenreHistoryItem>[];
}) {
  return (
    <div className="space-y-4">
      {snapshots.map((snapshot) => (
        <SnapshotShell
          key={snapshot.syncedAt}
          syncedAt={snapshot.syncedAt}
          itemCount={snapshot.items.length}
          noun="genres"
        >
          <div className="space-y-2">
            {snapshot.items.slice(0, 10).map((item) => (
              <div
                key={`${snapshot.syncedAt}-${item.genre}`}
                className="flex items-center gap-3 rounded-2xl border border-white/6 bg-black/10 px-3 py-3 transition-colors hover:bg-white/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-semibold text-white">
                  {item.rank}
                </div>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {item.genre}
                </span>
                <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] text-spotify-subtext">
                  Score {item.count}
                </span>
              </div>
            ))}
          </div>
        </SnapshotShell>
      ))}
    </div>
  );
}

export function TopHistoryPanel({ kind, timeRange }: TopHistoryPanelProps) {
  const tracksHistory = useQuery(
    api.topHistory.getTopTracksHistory,
    kind === "tracks" ? { timeRange, limit: 6 } : "skip"
  ) as SnapshotGroup<TrackHistoryItem>[] | undefined;
  const artistsHistory = useQuery(
    api.topHistory.getTopArtistsHistory,
    kind === "artists" ? { timeRange, limit: 6 } : "skip"
  ) as SnapshotGroup<ArtistHistoryItem>[] | undefined;
  const genresHistory = useQuery(
    api.topHistory.getTopGenresHistory,
    kind === "genres" ? { timeRange, limit: 6 } : "skip"
  ) as SnapshotGroup<GenreHistoryItem>[] | undefined;

  const snapshots =
    kind === "tracks"
      ? tracksHistory
      : kind === "artists"
        ? artistsHistory
        : genresHistory;

  if (snapshots === undefined) {
    return <HistoryPanelSkeleton />;
  }

  if (snapshots.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent px-5 py-10 text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
          <History className="h-4 w-4 text-spotify-subtext" />
        </div>
        <p className="text-sm font-medium">No saved history yet</p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-spotify-subtext">
          Open this term again later and snapshots for {formatTimeRangeLabel(timeRange).toLowerCase()} will start showing up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-[#1DB954]/12 via-white/[0.04] to-transparent">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-spotify-subtext">
              <Clock3 className="h-3.5 w-3.5" />
              <span>Saved history</span>
            </div>
            <h3 className="text-xl font-semibold tracking-tight">
              {getKindLabel(kind)} Snapshot Archive
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-spotify-subtext">
              Browse how your {getKindLabel(kind).toLowerCase()} changed across saved snapshots for {formatTimeRangeLabel(timeRange).toLowerCase()}.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 md:self-auto">
            <Sparkles className="h-4 w-4 text-spotify-green" />
            <span>{snapshots.length} saved snapshots</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-spotify-subtext">
            Term
          </p>
          <p className="mt-2 text-sm font-medium">{formatTimeRangeLabel(timeRange)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-spotify-subtext">
            Latest snapshot
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatRelativeSnapshotDate(snapshots[0].syncedAt)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-spotify-subtext">
            History depth
          </p>
          <p className="mt-2 text-sm font-medium">{snapshots.length} captures</p>
        </div>
      </div>

      {kind === "tracks" ? <TracksHistoryView snapshots={tracksHistory ?? []} /> : null}
      {kind === "artists" ? <ArtistsHistoryView snapshots={artistsHistory ?? []} /> : null}
      {kind === "genres" ? <GenresHistoryView snapshots={genresHistory ?? []} /> : null}
    </div>
  );
}
