"use client";

import { startTransition, useEffect, useState, useTransition } from "react";
import type { TimeRange } from "@/types/spotify";

const VALID_RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];

function isTimeRange(value: string | null): value is TimeRange {
  return value !== null && VALID_RANGES.includes(value as TimeRange);
}

function readRangeFromUrl(fallback: TimeRange): TimeRange {
  if (typeof window === "undefined") return fallback;
  const fromUrl = new URLSearchParams(window.location.search).get("range");
  return isTimeRange(fromUrl) ? fromUrl : fallback;
}

function writeRangeToUrl(range: TimeRange) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("range", range);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function useTimeRange(initial: TimeRange = "short_term") {
  const [timeRange, setTimeRangeState] = useState<TimeRange>(initial);
  const [isPending, startPendingTransition] = useTransition();

  useEffect(() => {
    const fromUrl = readRangeFromUrl(initial);
    if (fromUrl !== timeRange) {
      setTimeRangeState(fromUrl);
    }
    // Sync default into the URL so shared links keep context
    writeRangeToUrl(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once from the URL on mount
  }, []);

  const setDeferredTimeRange = (nextTimeRange: TimeRange) => {
    if (nextTimeRange === timeRange) {
      return;
    }

    startPendingTransition(() => {
      startTransition(() => {
        setTimeRangeState(nextTimeRange);
        writeRangeToUrl(nextTimeRange);
      });
    });
  };

  return { timeRange, setTimeRange: setDeferredTimeRange, isPending };
}

export function timeRangeLabel(range: TimeRange): string {
  switch (range) {
    case "short_term":
      return "past 4 weeks";
    case "medium_term":
      return "past 6 months";
    case "long_term":
      return "all time";
  }
}
