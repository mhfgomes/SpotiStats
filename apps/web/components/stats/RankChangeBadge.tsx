"use client";

import { ArrowDown, ArrowUp, Dot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type RankChange =
  | { direction: "up"; delta: number }
  | { direction: "down"; delta: number }
  | { direction: "same"; delta: 0 }
  | { direction: "new"; delta: null };

function formatComparisonSnapshotDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getRankChange(
  currentRank: number,
  previousRank?: number | null
): RankChange | null {
  if (previousRank === undefined) return null;
  if (previousRank === null) return { direction: "new", delta: null };
  if (previousRank === currentRank) return { direction: "same", delta: 0 };
  if (previousRank > currentRank) {
    return { direction: "up", delta: previousRank - currentRank };
  }
  if (previousRank < currentRank) {
    return { direction: "down", delta: currentRank - previousRank };
  }
  return null;
}

export function RankChangeBadge({
  change,
  comparisonSnapshotSyncedAt,
  className,
}: {
  change: RankChange | null;
  comparisonSnapshotSyncedAt?: number | null;
  className?: string;
}) {
  if (!change) return null;

  const baseClassName =
    "inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded-full border px-2 text-[11px] font-semibold leading-none tabular-nums";
  const tooltipLabel = comparisonSnapshotSyncedAt
    ? formatComparisonSnapshotDate(comparisonSnapshotSyncedAt)
    : change.direction === "new"
      ? "New since previous snapshot"
      : change.direction === "same"
        ? "No change"
        : change.direction === "up"
          ? `Up ${change.delta}`
          : `Down ${change.delta}`;

  if (change.direction === "new") {
    return (
      <span
        className={cn(
          baseClassName,
          "border-amber-400/30 bg-amber-400/12 text-amber-200",
          className
        )}
        title={tooltipLabel}
      >
        <Sparkles className="h-3.5 w-3.5" />
      </span>
    );
  }

  if (change.direction === "same") {
    return (
      <span
        className={cn(
          baseClassName,
          "border-white/12 bg-white/6 text-spotify-subtext",
          className
        )}
        title={tooltipLabel}
      >
        <Dot className="h-4 w-4" />
      </span>
    );
  }

  if (change.direction === "up") {
    return (
      <span
        className={cn(
          baseClassName,
          "border-emerald-400/30 bg-emerald-400/12 text-emerald-200",
          className
        )}
        title={tooltipLabel}
      >
        <ArrowUp className="h-3.5 w-3.5" />
        <span>{change.delta}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        baseClassName,
        "border-rose-400/30 bg-rose-400/12 text-rose-200",
        className
      )}
      title={tooltipLabel}
    >
      <ArrowDown className="h-3.5 w-3.5" />
      <span>{change.delta}</span>
    </span>
  );
}
