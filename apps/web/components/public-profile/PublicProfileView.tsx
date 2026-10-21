import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Music2 } from "lucide-react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import { PROFILE_BLOCK_LABELS } from "@/lib/profileBlocks";
import { CARD_THEMES, type CardTheme, type CardThemeKey } from "@/lib/themes";
import { cn, formatTimeRangeLabel } from "@/lib/utils";

export type PublicProfileData = NonNullable<
  FunctionReturnType<typeof api.publicProfiles.getPublicProfileByHandle>
>;
type Block = PublicProfileData["blocks"][number];
type BlockOf<T extends Block["type"]> = Extract<Block, { type: T }>;

function blockTitle(block: Block) {
  if (block.title) return block.title;
  const label = PROFILE_BLOCK_LABELS[block.type];
  return "timeRange" in block
    ? `${label} · ${formatTimeRangeLabel(block.timeRange)}`
    : label;
}

function EmptyBlock({ theme }: { theme: CardTheme }) {
  return (
    <p className="text-sm" style={{ color: theme.footer }}>
      Nothing synced for this time range yet.
    </p>
  );
}

function ArtistsBlock({ block, theme }: { block: BlockOf<"artists">; theme: CardTheme }) {
  if (block.items.length === 0) return <EmptyBlock theme={theme} />;

  if (block.layout === "list") {
    return (
      <ol className="divide-y overflow-hidden rounded-xl" style={{ background: theme.track }}>
        {block.items.map((artist) => (
          <li key={artist.rank} style={{ borderColor: theme.divider }}>
            <a
              href={artist.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5"
            >
              <span className="w-6 shrink-0 text-right text-sm font-bold tabular-nums" style={{ color: theme.accent }}>
                {artist.rank}
              </span>
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                {artist.imageUrl && (
                  <Image src={artist.imageUrl} alt="" fill sizes="44px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{artist.name}</p>
                {artist.genres.length > 0 && (
                  <p className="truncate text-xs capitalize" style={{ color: theme.sub }}>
                    {artist.genres.join(", ")}
                  </p>
                )}
              </div>
            </a>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="grid grid-cols-3 gap-4 sm:grid-cols-5">
      {block.items.map((artist) => (
        <li key={artist.rank}>
          <a href={artist.url} target="_blank" rel="noopener noreferrer" className="group block text-center">
            <div
              className="relative mx-auto aspect-square w-full overflow-hidden rounded-full"
              style={{ background: theme.track }}
            >
              {artist.imageUrl && (
                <Image
                  src={artist.imageUrl}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-balance text-sm font-semibold leading-snug" title={artist.name}>
              <span style={{ color: theme.accent }}>{artist.rank}.</span> {artist.name}
            </p>
          </a>
        </li>
      ))}
    </ol>
  );
}

function TracksBlock({ block, theme }: { block: BlockOf<"tracks">; theme: CardTheme }) {
  if (block.items.length === 0) return <EmptyBlock theme={theme} />;

  if (block.layout === "grid") {
    return (
      <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {block.items.map((track) => {
          const content = (
            <>
              <div className="relative aspect-square w-full overflow-hidden rounded-lg" style={{ background: theme.track }}>
                {track.imageUrl && (
                  <Image
                    src={track.imageUrl}
                    alt=""
                    fill
                    sizes="180px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug" title={track.name}>
                <span style={{ color: theme.accent }}>{track.rank}.</span> {track.name}
              </p>
              <p className="truncate text-xs" style={{ color: theme.sub }}>
                {track.artistNames.join(", ")}
              </p>
            </>
          );
          return (
            <li key={track.rank}>
              {track.url ? (
                <a href={track.url} target="_blank" rel="noopener noreferrer" className="group block">
                  {content}
                </a>
              ) : (
                <div>{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="divide-y overflow-hidden rounded-xl" style={{ background: theme.track }}>
      {block.items.map((track) => {
        const content = (
          <>
            <span className="w-6 shrink-0 text-right text-sm font-bold tabular-nums" style={{ color: theme.accent }}>
              {track.rank}
            </span>
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md">
              {track.imageUrl && (
                <Image src={track.imageUrl} alt="" fill sizes="44px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{track.name}</p>
              <p className="truncate text-xs" style={{ color: theme.sub }}>
                {track.artistNames.join(", ")}
              </p>
            </div>
          </>
        );
        return (
          <li key={track.rank} style={{ borderColor: theme.divider }}>
            {track.url ? (
              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5"
              >
                {content}
              </a>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2.5">{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function GenresBlock({ block, theme }: { block: BlockOf<"genres">; theme: CardTheme }) {
  if (block.items.length === 0) return <EmptyBlock theme={theme} />;
  const maxCount = Math.max(1, ...block.items.map((genre) => genre.count));

  return (
    <ul className="space-y-2">
      {block.items.map((genre) => (
        <li key={genre.name} className="flex items-center gap-3">
          <span className="w-36 shrink-0 truncate text-sm capitalize">{genre.name}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: theme.track }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${(genre.count / maxCount) * 100}%`, background: theme.accent }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PublicProfileView({
  profile,
  renderNowPlaying,
  compact = false,
}: {
  profile: PublicProfileData;
  /** Renders the content of "now playing" blocks; they're hidden if omitted or it returns null. */
  renderNowPlaying?: () => ReactNode;
  /** Tighter layout for the in-dashboard preview. */
  compact?: boolean;
}) {
  const theme = CARD_THEMES[profile.theme as CardThemeKey] ?? CARD_THEMES.midnight;

  const renderBlockBody = (block: Block) => {
    switch (block.type) {
      case "artists":
        return <ArtistsBlock block={block} theme={theme} />;
      case "tracks":
        return <TracksBlock block={block} theme={theme} />;
      case "genres":
        return <GenresBlock block={block} theme={theme} />;
      case "nowPlaying":
        return renderNowPlaying?.() ?? null;
      case "text":
        return (
          <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: theme.sub }}>
            {block.text}
          </p>
        );
    }
  };

  return (
    <div
      className={cn("relative overflow-hidden", compact ? "rounded-xl" : "min-h-screen")}
      style={{ background: theme.bg, color: theme.text }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.10) 1.3px, transparent 1.3px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div
        className={cn(
          "relative mx-auto max-w-3xl",
          compact ? "space-y-6 px-5 py-6" : "space-y-10 px-6 py-12 sm:py-16"
        )}
      >
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt=""
              width={112}
              height={112}
              unoptimized
              className={cn(
                "shrink-0 rounded-full object-cover shadow-xl ring-4",
                compact ? "h-20 w-20" : "h-28 w-28"
              )}
              style={{ ["--tw-ring-color" as string]: theme.divider }}
            />
          ) : (
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full text-3xl font-bold",
                compact ? "h-20 w-20" : "h-28 w-28"
              )}
              style={{ background: theme.track, color: theme.accent }}
            >
              {profile.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 space-y-2">
            <h1
              className={cn(
                "truncate font-extrabold tracking-tight",
                compact ? "text-2xl" : "text-4xl sm:text-5xl"
              )}
            >
              {profile.displayName}
            </h1>
            {profile.bio && (
              <p className="max-w-prose text-sm" style={{ color: theme.sub }}>
                {profile.bio}
              </p>
            )}
          </div>
        </header>

        {profile.blocks.map((block) => {
          const body = renderBlockBody(block);
          if (body == null) return null;
          return (
            <section key={block.id}>
              <h2
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: theme.sub }}
              >
                {blockTitle(block)}
              </h2>
              {body}
            </section>
          );
        })}

        <footer
          className="flex items-center justify-between border-t pt-5 text-xs"
          style={{ borderColor: theme.divider, color: theme.footer }}
        >
          <span>
            {profile.syncedAt
              ? `Updated ${new Date(profile.syncedAt).toLocaleDateString("en", { dateStyle: "medium" })}`
              : "Not synced yet"}
          </span>
          <Link href="/" className="flex items-center gap-1.5 hover:underline">
            <Music2 className="h-3.5 w-3.5" style={{ color: theme.accent }} aria-hidden />
            Made with SpotiStats
          </Link>
        </footer>
      </div>
    </div>
  );
}
