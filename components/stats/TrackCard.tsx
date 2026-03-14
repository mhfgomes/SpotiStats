import Image from "next/image";
import { formatDuration } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import {
  RankChangeBadge,
  type RankChange,
} from "@/components/stats/RankChangeBadge";

interface TrackCardProps {
  rank: number;
  trackName: string;
  albumName: string;
  albumExternalUrl?: string;
  albumImageUrl?: string;
  artistNames: string[];
  artistSpotifyIds: string[];
  durationMs: number;
  explicit: boolean;
  externalUrl: string;
  popularity: number;
  rankChange?: RankChange | null;
}

export function TrackCard({
  rank,
  trackName,
  albumName,
  albumExternalUrl,
  albumImageUrl,
  artistNames,
  artistSpotifyIds,
  durationMs,
  explicit,
  externalUrl,
  popularity,
  rankChange,
}: TrackCardProps) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
      <div className="flex w-12 shrink-0 items-center gap-2">
        <div className="flex w-4 justify-center">
          <RankChangeBadge change={rankChange ?? null} />
        </div>
        {/* Rank */}
        <span className="text-spotify-subtext text-sm font-mono w-6 text-right shrink-0">
          {rank}
        </span>
      </div>

      {/* Album art */}
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-spotify-card block"
      >
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
      </a>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium truncate hover:text-spotify-green transition-colors"
          >
            {trackName}
          </a>
          {explicit && (
            <span className="text-[10px] bg-spotify-subtext/30 text-spotify-subtext px-1 py-0.5 rounded font-medium shrink-0">
              E
            </span>
          )}
        </div>
        <p className="text-xs text-spotify-subtext truncate">
          {artistNames.map((name, i) => (
            <span key={i}>
              {i > 0 && ", "}
              <a
                href={`https://open.spotify.com/artist/${artistSpotifyIds[i]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-spotify-green transition-colors"
              >
                {name}
              </a>
            </span>
          ))}
        </p>
      </div>

      {/* Album name (hidden on small screens) */}
      {albumExternalUrl ? (
        <a
          href={albumExternalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-spotify-subtext truncate hidden md:block w-40 shrink-0 hover:text-spotify-green transition-colors"
        >
          {albumName}
        </a>
      ) : (
        <p className="text-xs text-spotify-subtext truncate hidden md:block w-40 shrink-0">
          {albumName}
        </p>
      )}

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

      {/* Duration */}
      <span className="text-xs text-spotify-subtext hidden sm:block w-10 shrink-0 text-right">
        {formatDuration(durationMs)}
      </span>

      {/* Link */}
      <div className="w-5 shrink-0 flex items-center justify-center">
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
