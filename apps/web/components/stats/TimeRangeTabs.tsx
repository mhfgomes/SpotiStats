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
    <div className="flex items-center gap-1 rounded-full bg-white/5 p-1 w-fit">
      {RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          disabled={isPending}
          className={cn(
            "relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 disabled:cursor-wait",
            value === range.value
              ? "bg-spotify-green text-black"
              : "text-spotify-subtext hover:text-white"
          )}
        >
          <span className={cn("transition-opacity", isPending && "opacity-70")}>
            {range.label}
          </span>
          {isPending && value === range.value ? (
            <span className="absolute inset-x-3 bottom-1 h-px animate-pulse bg-black/60" />
          ) : null}
        </button>
      ))}
    </div>
  );
}
