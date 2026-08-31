"use client";

import Image from "next/image";
import { Calendar, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccountPageData, FeedbackState } from "@/lib/account";
import { formatDate } from "@/lib/account";

type AccountOverviewCardProps = {
  authUser: AccountPageData["authUser"];
  spotifyProfile: AccountPageData["spotifyProfile"];
  canRefreshProfile: boolean;
  isRefreshing: boolean;
  feedback: FeedbackState;
  onRefreshProfile: () => void;
  onSignOut: () => void;
};

export function AccountOverviewCard({
  authUser,
  spotifyProfile,
  canRefreshProfile,
  isRefreshing,
  feedback,
  onRefreshProfile,
  onSignOut,
}: AccountOverviewCardProps) {
  if (!authUser) {
    return (
      <section className="spotify-card overflow-hidden px-5 py-8 text-center">
        <p className="text-sm text-spotify-subtext">
          Account data is temporarily unavailable.
        </p>
      </section>
    );
  }

  return (
    <section className="spotify-card overflow-hidden">
      <div className="px-5 py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {authUser.image ? (
              <Image
                src={authUser.image}
                alt={authUser.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border-2 border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/10 bg-white/5 text-xl font-semibold text-white">
                {authUser.name[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-white">
                {authUser.name}
              </h2>
              <p className="truncate text-sm text-spotify-subtext">
                {authUser.email}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-spotify-subtext">
                <Calendar className="h-3 w-3" />
                Member since {formatDate(authUser.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshProfile}
              disabled={isRefreshing || !canRefreshProfile}
            >
              <RefreshCw
                className={isRefreshing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"}
              />
              {isRefreshing ? "Syncing..." : "Sync Profile"}
            </Button>
            <Button variant="secondary" size="sm" onClick={onSignOut}>
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>

        {feedback ? (
          <div
            className={`mt-4 rounded-xl px-4 py-2.5 text-sm ${
              feedback.type === "success"
                ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                : "border border-red-400/20 bg-red-500/10 text-red-300"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}
      </div>
    </section>
  );
}
