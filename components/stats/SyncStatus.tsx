"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function SyncStatus() {
  const status = useQuery(api.syncStatus.getSyncStatus);
  const triggerSync = useMutation(api.users.triggerManualSync);

  if (status === undefined) {
    return <Skeleton className="h-4 w-32 rounded-full" />;
  }

  if (!status) return null;

  return (
    <div className="flex items-center gap-3">
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
          <span>Never synced</span>
        )}
      </div>

      <button
        onClick={() => triggerSync()}
        disabled={status.syncInProgress}
        title="Sync now"
        className="p-1.5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-spotify-subtext hover:text-white"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 ${status.syncInProgress ? "animate-spin" : ""}`}
        />
      </button>
    </div>
  );
}
