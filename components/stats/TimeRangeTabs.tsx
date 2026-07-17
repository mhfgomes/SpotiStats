"use client";

import { cn } from "@/lib/utils";
import type { TimeRange } from "@/types/spotify";

const RANGES: { value: TimeRange; label: string }[] = [
  { value: "short_term", label: "4 Weeks" },
  { value: "medium_term", label: "6 Months" },
  { value: "long_term", label: "All Time" },
];

interface TimeRangeTabsProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  isPending?: boolean;
}

export function TimeRangeTabs({
  value,
  onChange,
  isPending = false,
}: TimeRangeTabsProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Time range"
      className="flex w-fit items-center gap-1 rounded-full bg-white/5 p-1"
    >
      {RANGES.map((range) => {
        const selected = value === range.value;
        return (
          <button
            key={range.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(range.value)}
            disabled={isPending}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green focus-visible:ring-offset-2 focus-visible:ring-offset-spotify-black disabled:cursor-wait",
              selected
                ? "bg-spotify-green text-black"
                : "text-spotify-subtext hover:text-white"
            )}
          >
            <span className={cn("transition-opacity", isPending && "opacity-70")}>
              {range.label}
            </span>
            {isPending && selected ? (
              <span className="absolute inset-x-3 bottom-1 h-px animate-pulse bg-black/60" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
