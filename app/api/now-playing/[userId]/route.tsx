import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CARD_THEMES } from "@/lib/themes";
import type { CardThemeKey } from "@/lib/themes";

export const runtime = "nodejs";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function trunc(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function msToTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Fetch an external image and return a base64 data URI so it can be inlined
 *  into the SVG (external URLs are blocked when SVG is rendered inside <img>). */
async function toDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const mime = res.headers.get("content-type") ?? "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Extract the two hex colors from a CSS linear-gradient string. */
function parseBgColors(bg: string): [string, string] {
  const m = bg.match(/#[0-9a-fA-F]{3,6}/g);
  return m && m.length >= 2 ? [m[0], m[1]] : ["#1e3c72", "#2a5298"];
}

// ─── SVG builder ──────────────────────────────────────────────────────────────

type NowPlayingData = {
  trackName: string;
  artistNames: string[];
  albumImageUrl: string | null;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
} | null;

function buildSvg(
  data: NowPlayingData,
  theme: (typeof CARD_THEMES)[CardThemeKey],
  displayName: string,
  albumDataUri: string | null,
): string {
  const W = 800;
  const H = 200;
  const ART = 160;
  const artX = 20;
  const artY = 20;
  const contentX = artX + ART + 24; // 204
  const rightEdge = W - 28;         // 772

  const [c1, c2] = parseBgColors(theme.bg);
  const isPlaying = data?.isPlaying ?? false;

  // ── Equalizer bars ──────────────────────────────────────────────────────────
  const BAR_W = 3;
  const BAR_GAP = 2;
  const BAR_STEP = BAR_W + BAR_GAP;
  const BOX_H = 24; // container height; bars grow upward from the bottom
  const MIN_H = 3;
  const peakHeights = [8, 16, 22, 10, 24, 14, 8, 20, 18, 12, 8, 16];
  const barsWidth = peakHeights.length * BAR_STEP - BAR_GAP;

  const bars = peakHeights.map((peak, i) => {
    const x = i * BAR_STEP;
    if (!isPlaying) {
      return `<rect x="${x}" y="${BOX_H - MIN_H}" width="${BAR_W}" height="${MIN_H}" rx="1.5" fill="${theme.accent}" opacity="0.35"/>`;
    }
    const dur  = (0.55 + (i % 4) * 0.13).toFixed(2);
    const begin = ((i * 0.09) % 0.55).toFixed(2);
    const ks = "0.42,0,0.58,1";
    return `<rect x="${x}" y="${BOX_H - MIN_H}" width="${BAR_W}" height="${MIN_H}" rx="1.5" fill="${theme.accent}" opacity="0.9">
      <animate attributeName="height" values="${MIN_H};${peak};${MIN_H}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="${ks};${ks}"/>
      <animate attributeName="y"      values="${BOX_H - MIN_H};${BOX_H - peak};${BOX_H - MIN_H}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="${ks};${ks}"/>
    </rect>`;
  }).join("\n    ");

  const barsGroupY = 86; // top of bar container (bars bottom = 86+24 = 110)
  const labelX = contentX + barsWidth + 8;
  const labelY = barsGroupY + BOX_H - 5; // baseline near bar bottom

  // ── Album art ───────────────────────────────────────────────────────────────
  const albumSvg = albumDataUri
    ? `<clipPath id="ac"><rect x="${artX}" y="${artY}" width="${ART}" height="${ART}" rx="10"/></clipPath>
  <image href="${albumDataUri}" x="${artX}" y="${artY}" width="${ART}" height="${ART}" clip-path="url(#ac)" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="${artX}" y="${artY}" width="${ART}" height="${ART}" rx="10" fill="${theme.track}"/>
  <text x="${artX + ART / 2}" y="${artY + ART / 2 + 16}" font-family="sans-serif" font-size="52" text-anchor="middle" fill="${theme.sub}">♪</text>`;

  // ── Text content ────────────────────────────────────────────────────────────
  const statusLabel = data ? (isPlaying ? "NOW PLAYING" : "PAUSED") : "NOT PLAYING";
  const trackText   = data ? esc(trunc(data.trackName, 38)) : "Nothing is playing right now";
  const artistText  = data ? esc(trunc(data.artistNames.join(", "), 46)) : "Start playing something on Spotify.";
  const trackSize   = data ? 22 : 16;
  const artistFill  = data ? theme.sub : theme.footer;
  const trackY = 128;
  const artistY = 150;

  // ── Progress bar ────────────────────────────────────────────────────────────
  const progressBarW = rightEdge - contentX;
  const pct = data
    ? Math.min(100, (data.progressMs / Math.max(data.durationMs, 1)) * 100)
    : 0;
  const filledW = (progressBarW * pct) / 100;

  const progressSvg = data ? `
  <rect x="${contentX}" y="163" width="${progressBarW}" height="3" rx="1.5" fill="${theme.divider}"/>
  <rect x="${contentX}" y="163" width="${filledW.toFixed(1)}" height="3" rx="1.5" fill="${theme.accent}"/>
  <text x="${contentX}" y="178" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="10" fill="${theme.footer}">${msToTime(data.progressMs)}</text>
  <text x="${rightEdge}" y="178" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="10" fill="${theme.footer}" text-anchor="end">${msToTime(data.durationMs)}</text>` : "";

  // ── Assemble ─────────────────────────────────────────────────────────────────
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="1.3" cy="1.3" r="1.3" fill="rgba(255,255,255,0.10)"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>

  <!-- Album art -->
  ${albumSvg}

  <!-- Equalizer bars -->
  <g transform="translate(${contentX}, ${barsGroupY})">
    ${bars}
  </g>

  <!-- Status label -->
  <text x="${labelX}" y="${labelY}" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="10" font-weight="800" fill="${theme.accent}" letter-spacing="2">${statusLabel}</text>

  <!-- Branding -->
  <text x="${rightEdge}" y="32" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="11" font-weight="700" fill="${theme.text}" text-anchor="end">SpotiStats</text>
  <text x="${rightEdge}" y="46" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="9" fill="${theme.footer}" text-anchor="end">${esc(trunc(displayName, 22))}</text>

  <!-- Track name -->
  <text x="${contentX}" y="${trackY}" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="${trackSize}" font-weight="800" fill="${theme.text}">${trackText}</text>

  <!-- Artist -->
  <text x="${contentX}" y="${artistY}" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" font-size="13" fill="${artistFill}">${artistText}</text>
  ${progressSvg}
</svg>`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const { searchParams } = new URL(req.url);

    const themeKey = (searchParams.get("theme") ?? "ocean") as CardThemeKey;
    const theme = CARD_THEMES[themeKey] ?? CARD_THEMES.ocean;
    const spotifyUserId = userId as Id<"spotifyUsers">;

    const [nowPlayingResult, userResult] = await Promise.allSettled([
      client.action(api.nowPlaying.getNowPlayingPublic, { spotifyUserId }),
      client.query(api.users.getSpotifyUserPublic, { spotifyUserId }),
    ]);

    if (nowPlayingResult.status === "rejected") {
      console.error("[now-playing] action error:", nowPlayingResult.reason);
    }

    const nowPlaying = nowPlayingResult.status === "fulfilled" ? nowPlayingResult.value : null;
    const user = userResult.status === "fulfilled" ? userResult.value : null;

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const albumDataUri = nowPlaying?.albumImageUrl
      ? await toDataUri(nowPlaying.albumImageUrl)
      : null;

    return new Response(buildSvg(nowPlaying, theme, user.displayName, albumDataUri), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("[now-playing] error:", err);
    return new Response("Internal error", { status: 500 });
  }
}
