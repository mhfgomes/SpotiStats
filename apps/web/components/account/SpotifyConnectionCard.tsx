"use client";

import { Link2, Music2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccountPageData, FeedbackState } from "@/lib/account";
import { formatDate } from "@/lib/account";

type SpotifyConnectionCardProps = {
  spotifyAccount: AccountPageData["spotifyAccount"];
  spotifyProfile: AccountPageData["spotifyProfile"];
  isRefreshing: boolean;
  feedback: FeedbackState;
  onRefreshProfile: () => void;
  onReconnect: () => void;
};

export function SpotifyConnectionCard({
  spotifyAccount,
  spotifyProfile,
  isRefreshing,
  feedback,
  onRefreshProfile,
  onReconnect,
}: SpotifyConnectionCardProps) {
  return (
    <section className="spotify-card overflow-hidden">
      <div className="border-b border-white/5 px-5 py-4">
        <h2 className="text-base font-semibold text-white">Spotify Connection</h2>
      </div>

      <div className="px-5 py-5">
        {spotifyAccount.connected ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-green/10">
                <Music2 className="h-5 w-5 text-spotify-green" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">
                    {spotifyProfile?.displayName ?? "Connected"}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    Connected
                  </span>
                </div>
                <p className="text-xs text-spotify-subtext">
                  Linked {formatDate(spotifyAccount.linkedAt)}
                  {spotifyProfile?.spotifyId
                    ? ` · ${spotifyProfile.spotifyId}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onReconnect}
                disabled={isRefreshing}
              >
                <Link2 className="h-3.5 w-3.5" />
                Reconnect
              </Button>
              <Button
                size="sm"
                onClick={onRefreshProfile}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={isRefreshing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"}
                />
                {isRefreshing ? "Syncing..." : "Sync"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <Music2 className="h-6 w-6 text-spotify-subtext" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Spotify not connected
              </p>
              <p className="mt-1 text-xs text-spotify-subtext">
                Connect your Spotify account to unlock all features.
              </p>
            </div>
            <Button size="sm" onClick={onReconnect}>
              <Link2 className="h-3.5 w-3.5" />
              Connect Spotify
            </Button>
          </div>
        )}

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
