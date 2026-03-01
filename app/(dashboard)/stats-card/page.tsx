"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check, Link2, Code, RefreshCw, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { THEME_SWATCHES } from "@/lib/themes";
import type { CardThemeKey } from "@/lib/themes";

// ─── Config ───────────────────────────────────────────────────────────────────

const BANNER_TYPES = [
  {
    id: "classic",
    label: "Classic",
    desc: "Top artist, genres, and tracks",
    size: "1200 × 630",
    aspect: "1200/630",
  },
  {
    id: "tracks",
    label: "Tracks",
    desc: "8 top tracks in two columns",
    size: "1200 × 630",
    aspect: "1200/630",
  },
  {
    id: "artists",
    label: "Artists",
    desc: "Top 5 artists with avatars",
    size: "1200 × 630",
    aspect: "1200/630",
  },
  {
    id: "compact",
    label: "Compact",
    desc: "Square card for social media",
    size: "600 × 600",
    aspect: "1/1",
  },
] as const;

type BannerType = (typeof BANNER_TYPES)[number]["id"];

const THEMES = THEME_SWATCHES;
type ThemeId = CardThemeKey;

const RANGES = [
  { id: "short_term",  label: "Last 4 weeks" },
  { id: "medium_term", label: "Last 6 months" },
  { id: "long_term",   label: "All time" },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StatsCardPage() {
  const user = useQuery(api.users.getSpotifyUser);

  const [type, setType]   = useState<BannerType>("classic");
  const [theme, setTheme] = useState<ThemeId>("ocean");
  const [range, setRange] = useState<RangeId>("long_term");

  // preview key forces img remount when user explicitly refreshes
  const [previewKey, setPreviewKey] = useState(0);
  const [nowPlayingKey, setNowPlayingKey] = useState(0);
  const [copied, setCopied] = useState<"url" | "html" | "md" | "np-url" | "np-md" | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const cardUrl = user
    ? `${baseUrl}/api/card/${user._id}?type=${type}&theme=${theme}&range=${range}`
    : null;

  const nowPlayingUrl = user
    ? `${baseUrl}/api/now-playing/${user._id}?theme=${theme}`
    : null;

  const nowPlayingMd = nowPlayingUrl
    ? `[![Now Playing](${nowPlayingUrl})](${baseUrl})`
    : "";

  const htmlSnippet = cardUrl
    ? `<a href="${baseUrl}">\n  <img src="${cardUrl}" alt="${user?.displayName ?? "Spotify"} Stats" />\n</a>`
    : "";

  const mdSnippet = cardUrl
    ? `[![${user?.displayName ?? "Spotify"} Stats](${cardUrl})](${baseUrl})`
    : "";

  const copy = useCallback((text: string, which: typeof copied) => {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const currentType = BANNER_TYPES.find((t) => t.id === type)!;

  if (user === undefined) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="flex gap-6 mt-6">
          <Skeleton className="w-72 h-96 rounded-xl" />
          <Skeleton className="flex-1 h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-spotify-subtext text-sm">
          Generate a live image card of your stats — embed it anywhere that renders images.
        </p>
      </div>

      <div className="flex gap-6 items-start">

        {/* ── Left: options panel ─────────────────────────────── */}
        <aside className="w-72 shrink-0 space-y-6">

          {/* Banner type */}
          <div className="spotify-card p-4 space-y-3">
            <p className="text-xs font-semibold text-spotify-subtext uppercase tracking-widest">Banner type</p>
            <div className="space-y-2">
              {BANNER_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors border",
                    type === t.id
                      ? "bg-spotify-green/10 border-spotify-green/40 text-white"
                      : "border-white/5 hover:bg-white/5 text-spotify-subtext"
                  )}
                >
                  <div>
                    <p className={cn("text-sm font-semibold", type === t.id && "text-spotify-green")}>{t.label}</p>
                    <p className="text-xs text-spotify-subtext mt-0.5">{t.desc}</p>
                  </div>
                  <span className="text-[11px] text-spotify-subtext shrink-0 ml-2">{t.size}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="spotify-card p-4 space-y-3">
            <p className="text-xs font-semibold text-spotify-subtext uppercase tracking-widest">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors border",
                    theme === t.id
                      ? "border-white/40 bg-white/8"
                      : "border-white/5 hover:bg-white/5"
                  )}
                >
                  {/* Gradient swatch */}
                  <div
                    className="w-full h-8 rounded-md border border-white/10 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${t.bg1} 0%, ${t.bg2} 100%)` }}
                  >
                    {/* Dot accent marker */}
                    <div
                      className="absolute bottom-1 right-1 w-2 h-2 rounded-full"
                      style={{ background: t.dot }}
                    />
                    {theme === t.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <span className={cn("text-[10px] font-medium leading-none", theme === t.id ? "text-white" : "text-spotify-subtext")}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Time range */}
          <div className="spotify-card p-4 space-y-3">
            <p className="text-xs font-semibold text-spotify-subtext uppercase tracking-widest">Time range</p>
            <div className="space-y-2">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors border",
                    range === r.id
                      ? "bg-white/8 border-white/20 text-white"
                      : "border-white/5 hover:bg-white/5 text-spotify-subtext"
                  )}
                >
                  <span className="text-sm font-medium">{r.label}</span>
                  {range === r.id && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Right: preview + share ──────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Preview */}
          <div className="spotify-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-spotify-subtext uppercase tracking-widest">Preview</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-spotify-subtext">{currentType.size}</span>
                <button
                  onClick={() => setPreviewKey((k) => k + 1)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-spotify-subtext hover:text-white"
                  title="Refresh preview"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                {cardUrl && (
                  <a
                    href={cardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-spotify-subtext hover:text-white"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {cardUrl ? (
              <div className="rounded-lg overflow-hidden bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={`${cardUrl}-${previewKey}`}
                  src={cardUrl}
                  alt="Stats card preview"
                  className="w-full"
                  style={{ aspectRatio: currentType.aspect }}
                />
              </div>
            ) : (
              <Skeleton className="w-full rounded-lg" style={{ aspectRatio: currentType.aspect }} />
            )}
          </div>

          {/* Share */}
          <div className="spotify-card p-4 space-y-4">
            <p className="text-xs font-semibold text-spotify-subtext uppercase tracking-widest">Share</p>

            {/* Direct URL */}
            <div>
              <p className="text-xs text-spotify-subtext mb-1.5">Direct image URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] bg-black/40 rounded-lg px-3 py-2.5 truncate text-spotify-subtext border border-white/5 font-mono">
                  {cardUrl ?? "—"}
                </code>
                <button
                  onClick={() => cardUrl && copy(cardUrl, "url")}
                  disabled={!cardUrl}
                  className="shrink-0 flex items-center gap-1.5 bg-spotify-green hover:bg-[#1ed760] disabled:opacity-40 text-black font-bold text-xs py-2.5 px-3 rounded-lg transition-colors"
                >
                  {copied === "url" ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  {copied === "url" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* HTML embed */}
            <div>
              <p className="text-xs text-spotify-subtext mb-1.5">HTML embed</p>
              <div className="flex items-start gap-2">
                <pre className="flex-1 text-[11px] bg-black/40 rounded-lg px-3 py-2.5 text-spotify-subtext border border-white/5 font-mono overflow-x-auto whitespace-pre">
                  {htmlSnippet || "—"}
                </pre>
                <button
                  onClick={() => copy(htmlSnippet, "html")}
                  disabled={!cardUrl}
                  className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-colors"
                >
                  {copied === "html" ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                  {copied === "html" ? "Copied!" : "HTML"}
                </button>
              </div>
            </div>

            {/* Markdown */}
            <div>
              <p className="text-xs text-spotify-subtext mb-1.5">Markdown (GitHub README)</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] bg-black/40 rounded-lg px-3 py-2.5 truncate text-spotify-subtext border border-white/5 font-mono">
                  {mdSnippet || "—"}
                </code>
                <button
                  onClick={() => copy(mdSnippet, "md")}
                  disabled={!cardUrl}
                  className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-colors"
                >
                  {copied === "md" ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                  {copied === "md" ? "Copied!" : "MD"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Now Playing Banner ───────────────────────────────── */}
      <div className="mt-10 space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-spotify-subtext mb-1">Now Playing Banner</h2>
          <p className="text-xs text-spotify-subtext">
            A real-time card showing what you&apos;re listening to — refreshes on every load. Uses the theme selected above.
          </p>
        </div>

        {/* Preview */}
        <div className="spotify-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-spotify-subtext uppercase tracking-widest">Preview</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-spotify-subtext">800 × 200</span>
              <button
                onClick={() => setNowPlayingKey((k) => k + 1)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-spotify-subtext hover:text-white"
                title="Refresh preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              {nowPlayingUrl && (
                <a
                  href={nowPlayingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-spotify-subtext hover:text-white"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
          {nowPlayingUrl ? (
            <div className="rounded-lg overflow-hidden bg-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`${nowPlayingUrl}-${nowPlayingKey}`}
                src={nowPlayingUrl}
                alt="Now playing preview"
                className="w-full"
                style={{ aspectRatio: "800/200" }}
              />
            </div>
          ) : (
            <Skeleton className="w-full rounded-lg" style={{ aspectRatio: "800/200" }} />
          )}
        </div>

        {/* Share */}
        <div className="spotify-card p-4 space-y-4">
          <p className="text-xs font-semibold text-spotify-subtext uppercase tracking-widest">Share</p>
          <div>
            <p className="text-xs text-spotify-subtext mb-1.5">Direct image URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] bg-black/40 rounded-lg px-3 py-2.5 truncate text-spotify-subtext border border-white/5 font-mono">
                {nowPlayingUrl ?? "—"}
              </code>
              <button
                onClick={() => nowPlayingUrl && copy(nowPlayingUrl, "np-url")}
                disabled={!nowPlayingUrl}
                className="shrink-0 flex items-center gap-1.5 bg-spotify-green hover:bg-[#1ed760] disabled:opacity-40 text-black font-bold text-xs py-2.5 px-3 rounded-lg transition-colors"
              >
                {copied === "np-url" ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                {copied === "np-url" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-spotify-subtext mb-1.5">Markdown (GitHub README)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] bg-black/40 rounded-lg px-3 py-2.5 truncate text-spotify-subtext border border-white/5 font-mono">
                {nowPlayingMd || "—"}
              </code>
              <button
                onClick={() => copy(nowPlayingMd, "np-md")}
                disabled={!nowPlayingUrl}
                className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-colors"
              >
                {copied === "np-md" ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                {copied === "np-md" ? "Copied!" : "MD"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
