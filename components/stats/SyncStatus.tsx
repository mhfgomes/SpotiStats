"use client";

import { Radio } from "lucide-react";

export function SyncStatus() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-spotify-subtext">
      <Radio className="h-3.5 w-3.5 text-spotify-green" aria-hidden="true" />
      <span>Live from Spotify</span>
    </div>
  );
}
