"use client";

import { useRef, useState } from "react";
import { RecapCard } from "@/components/recap/RecapCard";
import { RecapDownloadButton } from "@/components/recap/RecapDownloadButton";
import { ShareCard } from "@/components/recap/ShareCard";
import { THEME_SWATCHES } from "@/lib/themes";
import type { CardThemeKey } from "@/lib/themes";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RecapPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [themeKey, setThemeKey] = useState<CardThemeKey>("ocean");

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      {/* Download card section */}
      <section>
        <p className="text-spotify-subtext text-sm mb-6">
          Your all-time Spotify stats in a shareable card
        </p>
        <div className="flex gap-8 items-start">
          {/* Card preview */}
          <div className="flex flex-col items-center gap-6 flex-shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-card-glow">
              <RecapCard cardRef={cardRef} themeKey={themeKey} />
            </div>
            <RecapDownloadButton cardRef={cardRef} />
          </div>

          {/* Theme picker */}
          <div className="spotify-card p-4 space-y-3 w-52 shrink-0">
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
                    className="w-full h-7 rounded-md border border-white/10 relative overflow-hidden"
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
        </div>
      </section>

      {/* API card / share section */}
      <section>
        <h2 className="text-base font-semibold mb-1">Live Banner</h2>
        <p className="text-spotify-subtext text-sm mb-5">
          A unique URL that generates your stats card as a 1200×630 image —
          perfect for GitHub READMEs, Discord bios, or social media.
        </p>
        <ShareCard themeKey={themeKey} />
      </section>
    </div>
  );
}
