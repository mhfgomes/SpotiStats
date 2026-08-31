"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Clock3 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  ArtistBoardSkeleton,
  ArtistSnapshotBoard,
  formatSnapshotDate,
  SnapshotPicker,
  type ArtistSnapshotItem,
} from "@/components/stats/SnapshotBoard";
import { TimeRangeTabs } from "@/components/stats/TimeRangeTabs";
import { TopArtistsList } from "@/components/stats/TopArtistsList";
import { useTimeRange } from "@/hooks/useTimeRange";

type SnapshotGroup<T> = {
  syncedAt: number;
  items: T[];
};

export default function TopArtistsPage() {
  const { timeRange, setTimeRange, isPending } = useTimeRange();
  const [selectedSnapshot, setSelectedSnapshot] = useState("now");

  const snapshots = useQuery(api.topHistory.getTopArtistsHistory, {
    timeRange,
    limit: 30,
  }) as SnapshotGroup<ArtistSnapshotItem>[] | undefined;

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
            <span className="flex-1">Artist</span>
            <span className="flex-1">Genres</span>
            <span className="w-5" />
          </div>
        </div>

        {effectiveSelectedSnapshot === "now" ? (
          <TopArtistsList timeRange={timeRange} />
        ) : snapshots === undefined ? (
          <ArtistBoardSkeleton />
        ) : activeSnapshot ? (
          <ArtistSnapshotBoard items={activeSnapshot.items} />
        ) : (
          <div className="px-5 py-12 text-center text-sm text-spotify-subtext">
            That snapshot is no longer available.
          </div>
        )}
      </div>
    </div>
  );
}
