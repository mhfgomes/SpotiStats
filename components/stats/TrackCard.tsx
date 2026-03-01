import Image from "next/image";
import { formatDuration } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface TrackCardProps {
  rank: number;
  trackName: string;
  albumName: string;
  albumImageUrl?: string;
  artistNames: string[];
  durationMs: number;
  explicit: boolean;
  externalUrl: string;
  popularity: number;
}

export function TrackCard({
  rank,
  trackName,
  albumName,
  albumImageUrl,
  artistNames,
  durationMs,
  explicit,
  externalUrl,
  popularity,
}: TrackCardProps) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
      {/* Rank */}
      <span className="text-spotify-subtext text-sm font-mono w-6 text-right shrink-0">
        {rank}
      </span>

      {/* Album art */}
      <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-spotify-card">
        {albumImageUrl ? (
          <Image
            src={albumImageUrl}
            alt={albumName}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="w-full h-full bg-spotify-card flex items-center justify-center">
            <span className="text-spotify-subtext text-xs">♪</span>
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{trackName}</p>
          {explicit && (
            <span className="text-[10px] bg-spotify-subtext/30 text-spotify-subtext px-1 py-0.5 rounded font-medium shrink-0">
              E
            </span>
          )}
        </div>
        <p className="text-xs text-spotify-subtext truncate">
          {artistNames.join(", ")}
        </p>
      </div>

      {/* Album name (hidden on small screens) */}
      <p className="text-xs text-spotify-subtext truncate hidden md:block max-w-[160px]">
        {albumName}
      </p>

      {/* Popularity bar */}
      <div className="hidden lg:flex items-center gap-2 w-24 shrink-0">
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-spotify-green rounded-full"
            style={{ width: `${popularity}%` }}
          />
        </div>
        <span className="text-xs text-spotify-subtext w-6 text-right">
          {popularity}
        </span>
      </div>

      {/* Duration + link */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-spotify-subtext hidden sm:block">
          {formatDuration(durationMs)}
        </span>
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-spotify-subtext hover:text-spotify-green"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
