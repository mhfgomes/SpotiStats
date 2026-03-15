"use client";

import { useRef, useState } from "react";
import { RecapCard } from "@/components/recap/RecapCard";
import { RecapDownloadButton } from "@/components/recap/RecapDownloadButton";
import { THEME_SWATCHES } from "@/lib/themes";
import type { CardThemeKey } from "@/lib/themes";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RecapCardPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [themeKey, setThemeKey] = useState<CardThemeKey>("ocean");

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <p className="text-spotify-subtext text-sm">
          Your Spotify stats from the last 4 weeks in a downloadable 400 × 600 card
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
                  onClick={() => setThemeKey(t.id)}
                  title={t.label}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors border",
                    themeKey === t.id
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
                    {themeKey === t.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <span className={cn("text-[10px] font-medium leading-none", themeKey === t.id ? "text-white" : "text-spotify-subtext")}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Right: card preview + download ──────── */}
        <div className="flex flex-col items-center gap-6">
          <div className="rounded-2xl overflow-hidden shadow-card-glow">
            <RecapCard cardRef={cardRef} themeKey={themeKey} />
          </div>
          <RecapDownloadButton cardRef={cardRef} />
        </div>
      </div>
    </div>
  );
}
