"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TimeRangeTabs } from "@/components/stats/TimeRangeTabs";
import { TopHistoryPanel } from "@/components/stats/TopHistoryPanel";
import { Button } from "@/components/ui/button";
import { useTimeRange } from "@/hooks/useTimeRange";
import type { TimeRange } from "@/types/spotify";

type HistoryPageKind = "tracks" | "artists" | "genres";

interface TopHistoryPageProps {
  kind: HistoryPageKind;
  backHref: string;
  backLabel: string;
  description: string;
}

function isValidTimeRange(value: string | null): value is TimeRange {
  return (
    value === "short_term" ||
    value === "medium_term" ||
    value === "long_term"
  );
}

export function TopHistoryPage({
  kind,
  backHref,
  backLabel,
  description,
}: TopHistoryPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTimeRange = searchParams.get("term");
  const initialTimeRange = isValidTimeRange(requestedTimeRange)
    ? requestedTimeRange
    : "short_term";
  const { timeRange, setTimeRange, isPending } = useTimeRange(initialTimeRange);

  const handleTimeRangeChange = (nextTimeRange: TimeRange) => {
    setTimeRange(nextTimeRange);

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("term", nextTimeRange);
    router.replace(`?${nextSearchParams.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button asChild variant="ghost" size="sm" className="px-0 text-spotify-subtext hover:bg-transparent hover:text-white">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
          <div>
            <p className="text-sm text-spotify-subtext">{description}</p>
          </div>
        </div>

        <TimeRangeTabs
          value={timeRange}
          onChange={handleTimeRangeChange}
          isPending={isPending}
        />
      </div>

      <TopHistoryPanel kind={kind} timeRange={timeRange} />
    </div>
  );
}
