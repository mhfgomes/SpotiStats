import Image from "next/image";
import { ExternalLink } from "lucide-react";

interface ArtistCardProps {
  rank: number;
  artistName: string;
  genres: string[];
  imageUrl?: string;
  externalUrl: string;
}

export function ArtistCard({
  rank,
  artistName,
  genres,
  imageUrl,
  externalUrl,
}: ArtistCardProps) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
      {/* Rank */}
      <span className="text-spotify-subtext text-sm font-mono w-6 text-right shrink-0">
        {rank}
      </span>

      {/* Artist image */}
      <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-spotify-card">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={artistName}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-spotify-card flex items-center justify-center">
            <span className="text-lg">🎤</span>
          </div>
        )}
      </div>

      {/* Artist name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{artistName}</p>
      </div>

      {/* Genres column */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-spotify-subtext truncate">
          {genres.slice(0, 3).join(" · ") || "No genres listed"}
        </p>
      </div>

      {/* Link */}
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-spotify-subtext hover:text-spotify-green shrink-0"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
