"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCircle, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function SyncStatus() {
  const status = useQuery(api.syncStatus.getSyncStatus);

  if (status === undefined) {
    return <Skeleton className="h-4 w-32 rounded-full" />;
  }

  if (!status) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-spotify-subtext">
      {status.syncInProgress ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-spotify-green" />
          <span>Syncing…</span>
        </>
      ) : status.lastSyncedAt ? (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-spotify-green" />
          <span>Synced {formatRelativeTime(status.lastSyncedAt)}</span>
        </>
      ) : (
        <span>Waiting for first automatic sync</span>
      )}
    </div>
  );
}
