"use client";

import { useState } from "react";
import type { TimeRange } from "@/types/spotify";

export function useTimeRange(initial: TimeRange = "medium_term") {
  const [timeRange, setTimeRange] = useState<TimeRange>(initial);
  return { timeRange, setTimeRange };
}
