"use client";

import { ArrowDown, ArrowUp, Dot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type RankChange =
  | { direction: "up"; delta: number }
  | { direction: "down"; delta: number }
  | { direction: "same"; delta: 0 }
  | { direction: "new"; delta: null };

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
  className,
}: {
  change: RankChange | null;
  className?: string;
}) {
  if (!change) return null;

  if (change.direction === "new") {
    return (
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/15 text-amber-300",
          className
        )}
        title="New since the previous snapshot"
      >
        <Sparkles className="h-3.5 w-3.5" />
      </span>
    );
  }

  if (change.direction === "same") {
    return (
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-spotify-subtext",
          className
        )}
        title="No change"
      >
        <Dot className="h-4 w-4" />
      </span>
    );
  }

  if (change.direction === "up") {
    return (
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300",
          className
        )}
        title={`Up ${change.delta}`}
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-400/15 text-rose-300",
        className
      )}
      title={`Down ${change.delta}`}
    >
      <ArrowDown className="h-3.5 w-3.5" />
    </span>
  );
}
