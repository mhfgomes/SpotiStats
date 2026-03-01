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
}

export function TimeRangeTabs({ value, onChange }: TimeRangeTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-full w-fit">
      {RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
            value === range.value
              ? "bg-spotify-green text-black"
              : "text-spotify-subtext hover:text-white"
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
