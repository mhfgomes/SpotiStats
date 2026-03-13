"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check, Link2, Code, RefreshCw, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { THEME_SWATCHES } from "@/lib/themes";
import type { CardThemeKey } from "@/lib/themes";

export function NowPlayingCardPage() {
  const user = useQuery(api.users.getSpotifyUser);

  const [theme, setTheme] = useState<CardThemeKey>("ocean");
  const [previewKey, setPreviewKey] = useState(0);
  const [copied, setCopied] = useState<"url" | "md" | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const nowPlayingUrl = user
    ? `${baseUrl}/api/now-playing/${user._id}?theme=${theme}`
    : null;

  const mdSnippet = nowPlayingUrl
    ? `[![Now Playing](${nowPlayingUrl})](${baseUrl})`
    : "";

  const copy = useCallback((text: string, which: typeof copied) => {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  if (user === undefined) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex gap-6 mt-2">
          <Skeleton className="w-64 h-64 rounded-xl" />
          <Skeleton className="flex-1 h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <p className="text-spotify-subtext text-sm">
          Real-time card showing what you&apos;re listening to — refreshes on every load. 800 × 200
        </p>
      </div>

      <div className="flex gap-6 items-start">

        {/* ── Left: theme picker ────────────────────── */}
        <aside className="w-64 shrink-0">
          <div className="spotify-card p-4 space-y-3">
            <p className="text-xs font-semibold text-spotify-subtext uppercase tracking-widest">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_SWATCHES.map((t) => (
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
                  <div
                    className="w-full h-8 rounded-md border border-white/10 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${t.bg1} 0%, ${t.bg2} 100%)` }}
                  >
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
        </aside>

        {/* ── Right: preview + share ──────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Preview */}
          <div className="spotify-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-spotify-subtext uppercase tracking-widest">Preview</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-spotify-subtext">800 × 200</span>
                <button
                  onClick={() => setPreviewKey((k) => k + 1)}
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
                  key={`${nowPlayingUrl}-${previewKey}`}
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
                  onClick={() => nowPlayingUrl && copy(nowPlayingUrl, "url")}
                  disabled={!nowPlayingUrl}
                  className="shrink-0 flex items-center gap-1.5 bg-spotify-green hover:bg-[#1ed760] disabled:opacity-40 text-black font-bold text-xs py-2.5 px-3 rounded-lg transition-colors"
                >
                  {copied === "url" ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  {copied === "url" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-spotify-subtext mb-1.5">Markdown (GitHub README)</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] bg-black/40 rounded-lg px-3 py-2.5 truncate text-spotify-subtext border border-white/5 font-mono">
                  {mdSnippet || "—"}
                </code>
                <button
                  onClick={() => copy(mdSnippet, "md")}
                  disabled={!nowPlayingUrl}
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
    </div>
  );
}
