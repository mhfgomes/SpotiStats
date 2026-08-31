"use client";

import { LaptopMinimal, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccountPageData, FeedbackState } from "@/lib/account";

type SessionListCardProps = {
  sessions: AccountPageData["sessions"];
  isRevoking: boolean;
  pendingSessionId: string | null;
  isLoadingLocations: boolean;
  sessionLocations: Record<string, string | null>;
  feedback: FeedbackState;
  onRevokeOtherSessions: () => void;
  onRevokeSession: (sessionId: string, isCurrent: boolean) => void;
};

function timeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SessionListCard({
  sessions,
  isRevoking,
  pendingSessionId,
  isLoadingLocations,
  sessionLocations,
  feedback,
  onRevokeOtherSessions,
  onRevokeSession,
}: SessionListCardProps) {
  const otherSessionCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <section className="spotify-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
        <h2 className="text-base font-semibold text-white">
          Active Sessions
          <span className="ml-2 text-sm font-normal text-spotify-subtext">
            ({sessions.length})
          </span>
        </h2>
        {otherSessionCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRevokeOtherSessions}
            disabled={isRevoking}
          >
            <LogOut className="h-3.5 w-3.5" />
            {isRevoking ? "Signing out..." : "Sign out other devices"}
          </Button>
        )}
      </div>

      <div className="divide-y divide-white/5">
        {sessions.map((session, index) => (
          <div
            key={`${session.id}-${session.createdAt}-${session.updatedAt}-${index}`}
            className="flex items-center gap-3 px-5 py-3.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 shrink-0">
              <LaptopMinimal className="h-4 w-4 text-spotify-subtext" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-white">
                  {session.deviceLabel}
                </p>
                {session.isCurrent && (
                  <span className="shrink-0 rounded-full bg-spotify-green/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-spotify-green">
                    This device
                  </span>
                )}
              </div>
              <p className="text-xs text-spotify-subtext">
                Active {timeAgo(session.updatedAt)}
              </p>
              <div className="mt-1 space-y-1 text-xs text-spotify-subtext">
                <p>IP {session.ipAddressMasked ?? "unavailable"}</p>
                <p>
                  Location{" "}
                  {isLoadingLocations
                    ? "loading..."
                    : session.ipAddressMasked
                      ? sessionLocations[session.ipAddressMasked] ?? "unavailable"
                      : "unavailable"}
                </p>
              </div>
            </div>
            <Button
              variant={session.isCurrent ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onRevokeSession(session.id, session.isCurrent)}
              disabled={isRevoking || pendingSessionId === session.id}
              className="shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              {pendingSessionId === session.id
                ? "Signing out..."
                : session.isCurrent
                  ? "Sign out here"
                  : "Revoke"}
            </Button>
          </div>
        ))}
      </div>

      {feedback ? (
        <div
          className={`mx-5 mb-4 rounded-xl px-4 py-2.5 text-sm ${
            feedback.type === "success"
              ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              : "border border-red-400/20 bg-red-500/10 text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}
    </section>
  );
}
