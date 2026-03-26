"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Clock3 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  formatSnapshotDate,
  SnapshotPicker,
  TrackBoardSkeleton,
  TrackSnapshotBoard,
  type TrackSnapshotItem,
} from "@/components/stats/SnapshotBoard";
import { TimeRangeTabs } from "@/components/stats/TimeRangeTabs";
import { TopTracksList } from "@/components/stats/TopTracksList";
import { useSnapshotTrackMetadata } from "@/hooks/useSnapshotTrackMetadata";
import { useTimeRange } from "@/hooks/useTimeRange";

type SnapshotGroup<T> = {
  syncedAt: number;
  items: T[];
};

export default function TopTracksPage() {
  const { timeRange, setTimeRange, isPending } = useTimeRange();
  const [selectedSnapshot, setSelectedSnapshot] = useState("now");

  const snapshots = useQuery(api.topHistory.getTopTracksHistory, {
    timeRange,
    limit: 30,
  }) as SnapshotGroup<TrackSnapshotItem>[] | undefined;

  const effectiveSelectedSnapshot =
    selectedSnapshot === "now" ||
    (snapshots ?? []).some(
      (snapshot) => String(snapshot.syncedAt) === selectedSnapshot
    )
      ? selectedSnapshot
      : "now";

  const activeSnapshot = useMemo(
    () =>
      (snapshots ?? []).find(
        (snapshot) => String(snapshot.syncedAt) === effectiveSelectedSnapshot
      ),
    [effectiveSelectedSnapshot, snapshots]
  );

  const selectedSnapshotLabel =
    effectiveSelectedSnapshot === "now"
      ? "Now"
      : formatSnapshotDate(Number(effectiveSelectedSnapshot));

  const hydratedSnapshotItems = useMemo(
    () =>
      (activeSnapshot?.items ?? []).map((item) => ({
        ...item,
      })),
    [activeSnapshot]
  );
  const { data: snapshotTrackMetadata, isLoading: isSnapshotMetadataLoading } =
    useSnapshotTrackMetadata(
      effectiveSelectedSnapshot === "now" ? [] : hydratedSnapshotItems
    );
  const snapshotItemsWithMetadata = useMemo(
    () =>
      hydratedSnapshotItems.map((item) => ({
        ...item,
        popularity:
          typeof item.popularity === "number"
            ? item.popularity
            : snapshotTrackMetadata[item.trackSpotifyId]?.popularity,
        durationMs:
          typeof item.durationMs === "number"
            ? item.durationMs
            : snapshotTrackMetadata[item.trackSpotifyId]?.durationMs,
        albumExternalUrl:
          item.albumExternalUrl ??
          snapshotTrackMetadata[item.trackSpotifyId]?.albumExternalUrl,
        artistSpotifyIds:
          item.artistSpotifyIds ??
          snapshotTrackMetadata[item.trackSpotifyId]?.artistSpotifyIds,
        externalUrl:
          item.externalUrl ??
          snapshotTrackMetadata[item.trackSpotifyId]?.externalUrl,
      })),
    [hydratedSnapshotItems, snapshotTrackMetadata]
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <SnapshotPicker
          value={effectiveSelectedSnapshot}
          onChange={setSelectedSnapshot}
          snapshots={snapshots ?? []}
          disabled={snapshots === undefined}
        />
        <TimeRangeTabs
          value={timeRange}
          onChange={(value) => {
            setSelectedSnapshot("now");
            setTimeRange(value);
          }}
          isPending={isPending}
        />
      </div>

      <div className="spotify-card overflow-hidden">
        <div className="border-b border-white/5 px-3 py-3">
          <div className="mb-2 flex items-center gap-2 text-sm text-white">
            <Clock3 className="h-4 w-4 text-spotify-green" />
            Viewing {selectedSnapshotLabel}
          </div>
          <div className="flex items-center gap-4 text-xs text-spotify-subtext uppercase tracking-wider">
            <span className="w-6 shrink-0 text-right">#</span>
            <span className="w-12 shrink-0" />
            <span className="flex-1">Title</span>
            <span className="hidden md:block w-40">Album</span>
            <span className="hidden lg:block w-24">Popularity</span>
            <span className="hidden sm:block w-10">Time</span>
            <span className="w-5" />
          </div>
        </div>

        {effectiveSelectedSnapshot === "now" ? (
          <TopTracksList timeRange={timeRange} />
        ) : snapshots === undefined ? (
          <TrackBoardSkeleton />
        ) : activeSnapshot ? (
          <TrackSnapshotBoard
            items={snapshotItemsWithMetadata}
            isMetadataLoading={isSnapshotMetadataLoading}
          />
        ) : (
          <div className="px-5 py-12 text-center text-sm text-spotify-subtext">
            That snapshot is no longer available.
          </div>
        )}
      </div>
    </div>
  );
}
