"use client";

import { startTransition, useState, useTransition } from "react";
import type { TimeRange } from "@/types/spotify";

export function useTimeRange(initial: TimeRange = "short_term") {
  const [timeRange, setTimeRange] = useState<TimeRange>(initial);
  const [isPending, startPendingTransition] = useTransition();

  const setDeferredTimeRange = (nextTimeRange: TimeRange) => {
    if (nextTimeRange === timeRange) {
      return;
    }

    startPendingTransition(() => {
      startTransition(() => {
        setTimeRange(nextTimeRange);
      });
    });
  };

  return { timeRange, setTimeRange: setDeferredTimeRange, isPending };
}
