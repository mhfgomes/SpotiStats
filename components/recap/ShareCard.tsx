"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link2, Check, Code } from "lucide-react";
import type { CardThemeKey } from "@/lib/themes";

interface ShareCardProps {
  themeKey?: CardThemeKey;
}

export function ShareCard({ themeKey = "ocean" }: ShareCardProps) {
  const user = useQuery(api.users.getSpotifyUser);
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (user === undefined) return null;
  if (!user) return null;

  const cardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/card/${user._id}?theme=${themeKey}`;
  const embedCode = `<a href="${process.env.NEXT_PUBLIC_SITE_URL}">\n  <img src="${cardUrl}" alt="${user.displayName}'s Spotify Stats" />\n</a>`;

  const copy = (text: string, which: "url" | "embed") => {
    navigator.clipboard.writeText(text);
    if (which === "url") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="spotify-card p-5">
        <p className="text-sm font-semibold mb-0.5">Shareable Stats Card</p>
        <p className="text-xs text-spotify-subtext mb-4">
          A live-generated image of your Spotify stats from the last 4 weeks. Works in
          Discord, Twitter, GitHub READMEs, and anywhere that renders images.
        </p>

        {/* URL row */}
        <div className="flex items-center gap-2 mb-3">
          <code className="flex-1 text-xs bg-black/40 rounded-lg px-3 py-2.5 truncate text-spotify-subtext border border-white/5 font-mono">
            {cardUrl}
          </code>
          <button
            onClick={() => copy(cardUrl, "url")}
            className="shrink-0 flex items-center gap-1.5 bg-spotify-green hover:bg-[#1ed760] text-black font-bold text-xs py-2.5 px-4 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Link2 className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy URL"}
          </button>
        </div>

        {/* Embed code row */}
        <div className="flex items-start gap-2">
          <pre className="flex-1 text-[11px] bg-black/40 rounded-lg px-3 py-2.5 text-spotify-subtext border border-white/5 font-mono overflow-x-auto whitespace-pre">
            {embedCode}
          </pre>
          <button
            onClick={() => copy(embedCode, "embed")}
            className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-colors mt-0"
          >
            {copiedEmbed ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Code className="w-3.5 h-3.5" />
            )}
            {copiedEmbed ? "Copied!" : "Copy HTML"}
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className="spotify-card p-4">
        <p className="text-xs text-spotify-subtext mb-3 font-medium">Preview</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardUrl}
          alt="Stats card preview"
          className="w-full rounded-lg"
        />
      </div>
    </div>
  );
}
