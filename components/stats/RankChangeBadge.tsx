"use client";

import { ArrowDown, ArrowUp, Dot } from "lucide-react";
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
  if (!change || change.direction === "new") return null;

  if (change.direction === "same") {
    return (
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-spotify-subtext",
          className
        )}
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
    >
      <ArrowDown className="h-3.5 w-3.5" />
    </span>
  );
}
