import Image from "next/image";
import type { CSSProperties } from "react";
import type { CardTheme } from "@/lib/themes";
import { cn, formatDuration } from "@/lib/utils";

// Same bar shape as the /api/now-playing banner.
const PEAK_HEIGHTS = [8, 16, 22, 10, 24, 14, 8, 20, 18, 12, 8, 16];
const BOX_H = 24;
const MIN_H = 3;

export type NowPlayingCardTrack = {
  trackName: string;
  artistNames: string[];
  albumImageUrl: string | null;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
};

function Equalizer({ playing, color }: { playing: boolean; color: string }) {
  return (
    <div className="flex items-end gap-[2px]" style={{ height: BOX_H }} aria-hidden>
      {PEAK_HEIGHTS.map((peak, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-full", playing && "motion-safe:animate-[np-eq_var(--dur)_ease-in-out_var(--delay)_infinite]")}
          style={
            {
              background: color,
              opacity: playing ? 0.9 : 0.35,
              height: playing ? peak : MIN_H,
              "--dur": `${0.55 + (i % 4) * 0.13}s`,
              "--delay": `${-((i * 0.09) % 0.55)}s`,
              "--min": `${MIN_H / peak}`,
              transformOrigin: "bottom",
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function NowPlayingCard({
  track,
  theme,
}: {
  /** null renders the idle "not playing" state. */
  track: NowPlayingCardTrack | null;
  theme: CardTheme;
}) {
  const playing = Boolean(track?.isPlaying);
  const status = !track ? "Not playing" : playing ? "Now playing" : "Paused";
  const pct = track
    ? Math.min(100, (track.progressMs / Math.max(track.durationMs, 1)) * 100)
    : 0;

  return (
    <div
      className="flex items-stretch gap-4 rounded-2xl p-4 sm:gap-6 sm:p-5"
      style={{ background: theme.track }}
    >
      <div
        className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl shadow-lg sm:w-32"
        style={{ background: theme.divider }}
      >
        {track?.albumImageUrl ? (
          <Image src={track.albumImageUrl} alt="" fill sizes="128px" className="object-cover" />
        ) : (
          <span
            className="absolute inset-0 flex items-center justify-center text-4xl"
            style={{ color: theme.sub }}
            aria-hidden
          >
            ♪
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-end">
        <div className="flex items-end gap-2">
          <Equalizer playing={playing} color={theme.accent} />
          <span
            className="pb-0.5 text-[10px] font-extrabold uppercase leading-none tracking-[0.2em]"
            style={{ color: theme.accent }}
          >
            {status}
          </span>
        </div>

        <p className="mt-1.5 truncate text-xl font-extrabold leading-tight sm:text-2xl">
          {track?.trackName ?? "Nothing right now"}
        </p>
        <p className="truncate text-sm" style={{ color: theme.sub }}>
          {track ? track.artistNames.join(", ") : "Check back later"}
        </p>

        {track && (
          <div className="mt-3">
            <div className="h-[3px] overflow-hidden rounded-full" style={{ background: theme.divider }}>
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-linear"
                style={{ width: `${pct}%`, background: theme.accent }}
              />
            </div>
            <div
              className="mt-1 flex justify-between text-[10px] tabular-nums"
              style={{ color: theme.footer }}
            >
              <span>{formatDuration(track.progressMs)}</span>
              <span>{formatDuration(track.durationMs)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
