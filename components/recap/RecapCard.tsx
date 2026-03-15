"use client";

import type React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { Music2 } from "lucide-react";
import { CARD_THEMES } from "@/lib/themes";
import type { CardThemeKey } from "@/lib/themes";

interface RecapCardProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  themeKey?: CardThemeKey;
}

export function RecapCard({ cardRef, themeKey = "ocean" }: RecapCardProps) {
  const topTracks = useQuery(api.tracks.getTopTracks, { timeRange: "short_term" });
  const topArtists = useQuery(api.artists.getTopArtists, { timeRange: "short_term" });
  const topGenres = useQuery(api.artists.getTopGenres, { timeRange: "short_term" });
  const user = useQuery(api.users.getSpotifyUser);

  const theme = CARD_THEMES[themeKey];

  const isLoading =
    topTracks === undefined ||
    topArtists === undefined ||
    topGenres === undefined ||
    user === undefined;

  const top5Tracks = topTracks?.slice(0, 5) ?? [];
  const topArtist = topArtists?.[0];
  const topGenre = topGenres?.[0]?.genre ?? "—";
  const year = new Date().getFullYear();

  const cardBase: React.CSSProperties = {
    width: 400,
    height: 600,
    background: theme.bg,
    display: "flex",
    flexDirection: "column",
    padding: "32px",
    position: "relative",
    overflow: "hidden",
    borderRadius: 20,
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    color: theme.text,
  };

  const skeletonBox = (w: number | string, h: number, radius = 4): React.CSSProperties => ({
    width: w,
    height: h,
    borderRadius: radius,
    background: "rgba(255,255,255,0.10)",
    flexShrink: 0,
  });

  if (isLoading) {
    return (
      <div ref={cardRef} style={cardBase}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: theme.accent, flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={skeletonBox(80, 11)} />
            <div style={skeletonBox(130, 9)} />
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={skeletonBox(70, 8, 3)} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
            <div style={{ ...skeletonBox(56, 56, 28) }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={skeletonBox(140, 18)} />
              <div style={skeletonBox(100, 10)} />
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: theme.divider, marginBottom: 20 }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...skeletonBox(70, 8, 3), marginBottom: 14 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={skeletonBox(18, 12)} />
                <div style={skeletonBox(36, 36, 4)} />
                <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
                  <div style={skeletonBox(`${80 - i * 6}%`, 12)} />
                  <div style={skeletonBox(`${60 - i * 4}%`, 9)} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${theme.divider}`, paddingTop: 16, marginTop: 16, display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={skeletonBox(60, 8)} />
            <div style={skeletonBox(80, 11)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
            <div style={skeletonBox(70, 8)} />
            <div style={skeletonBox(60, 11)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={cardRef} style={cardBase}>
      {/* Dot-grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.10) 1.3px, transparent 1.3px)",
          backgroundSize: "26px 26px",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, position: "relative" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: theme.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Music2 size={16} color="rgba(0,0,0,0.7)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.5, color: theme.text }}>
            SpotiStats
          </div>
          <div style={{ fontSize: 11, color: theme.sub }}>
            {user?.displayName ?? "Your"} &bull; {year} Recap
          </div>
        </div>
      </div>

      {/* Top Artist */}
      <div style={{ marginBottom: 20, position: "relative" }}>
        <div
          style={{
            fontSize: 10,
            color: theme.accent,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Top Artist
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {topArtist?.imageUrl ? (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                overflow: "hidden",
                position: "relative",
                flexShrink: 0,
                border: `2px solid ${theme.accent}`,
              }}
            >
              <Image
                src={topArtist.imageUrl}
                alt={topArtist.artistName}
                fill
                style={{ objectFit: "cover" }}
                sizes="56px"
              />
            </div>
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: theme.track,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                flexShrink: 0,
              }}
            >
              🎤
            </div>
          )}
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1, color: theme.text }}>
              {topArtist?.artistName ?? "—"}
            </div>
            <div style={{ fontSize: 11, color: theme.sub, marginTop: 2 }}>
              {topArtist?.genres.slice(0, 2).join(" · ") ?? ""}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: theme.divider, marginBottom: 20 }} />

      {/* Top Tracks */}
      <div style={{ flex: 1, position: "relative" }}>
        <div
          style={{
            fontSize: 10,
            color: theme.accent,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          Top Tracks
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {top5Tracks.map((track: typeof top5Tracks[number], i: number) => (
            <div key={track._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 12,
                  color: i === 0 ? theme.accent : theme.footer,
                  fontWeight: 700,
                  width: 18,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              {track.albumImageUrl && (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 4,
                    overflow: "hidden",
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={track.albumImageUrl}
                    alt={track.albumName}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="36px"
                  />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: i === 0 ? 700 : 500,
                    color: theme.text,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {track.trackName}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.sub,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {track.artistNames.join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${theme.divider}`,
          paddingTop: 16,
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: theme.footer, marginBottom: 2, textTransform: "uppercase", letterSpacing: 1.5 }}>
            Top Genre
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.accent }}>
            {topGenre}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: theme.footer, marginBottom: 2, textTransform: "uppercase", letterSpacing: 1.5 }}>
            Generated by
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>SpotiStats</div>
        </div>
      </div>
    </div>
  );
}
