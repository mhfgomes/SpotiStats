import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CARD_THEMES } from "@/lib/themes";
import type { CardTheme, CardThemeKey } from "@/lib/themes";

export const runtime = "nodejs";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const trunc = (s: string, max: number) =>
  s.length > max ? s.slice(0, max) + "…" : s;

type Theme = CardTheme;
type ThemeKey = CardThemeKey;

type Track = Awaited<ReturnType<typeof client.query<typeof api.tracks.getTopTracksPublic>>>[number];
type Artist = Awaited<ReturnType<typeof client.query<typeof api.artists.getTopArtistsPublic>>>[number];
type Genre = { genre: string; count: number };
type User = NonNullable<Awaited<ReturnType<typeof client.query<typeof api.users.getSpotifyUserPublic>>>>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchB64(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${ct};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

/** XML-escape text content */
function e(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Parse the two stop colors from a CSS linear-gradient string */
function parseBgColors(css: string): { c1: string; c2: string } {
  const m = css.match(/linear-gradient\([^,]+,\s*(\S+)\s+\d+%,\s*(\S+)\s+\d+%\)/);
  return m ? { c1: m[1], c2: m[2] } : { c1: "#111827", c2: "#1f2937" };
}

/**
 * Wrap body content in a complete SVG document.
 * The background uses a diagonal linearGradient derived from theme.bg,
 * overlaid with a dot pattern.
 */
function svgDoc(w: number, h: number, theme: Theme, body: string): string {
  const { c1, c2 } = parseBgColors(theme.bg);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="1.3" cy="1.3" r="1.3" fill="rgba(255,255,255,0.10)"/>
    </pattern>
    <clipPath id="card-clip">
      <rect width="${w}" height="${h}" rx="20"/>
    </clipPath>
  </defs>
  <rect width="${w}" height="${h}" rx="20" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" rx="20" fill="url(#dots)"/>
  <g font-family="system-ui,-apple-system,BlinkMacSystemFont,sans-serif" clip-path="url(#card-clip)">
    ${body}
  </g>
</svg>`;
}

// ─── Shared card header / footer ──────────────────────────────────────────────

function cardHeader(
  w: number, pl: number, pt: number,
  user: User, theme: Theme, rangeLabel: string,
  logoR = 22, titleSize = 28, nameSize = 20,
): string {
  const cy = pt + logoR;
  return `
  <circle cx="${pl + logoR}" cy="${cy}" r="${logoR}" fill="${theme.accent}"/>
  <text x="${pl + logoR}" y="${cy + 1}" text-anchor="middle" dominant-baseline="central" font-size="${logoR}" fill="${theme.text}">&#9834;</text>
  <text x="${pl + logoR * 2 + 14}" y="${cy + 1}" dominant-baseline="central" font-size="${titleSize}" font-weight="800" fill="${theme.text}">SpotiStats</text>
  <text x="${w - pl}" y="${cy - 7}" text-anchor="end" font-size="${nameSize}" font-weight="700" fill="${theme.text}">${e(trunc(user.displayName, 24))}</text>
  <text x="${w - pl}" y="${cy + 14}" text-anchor="end" font-size="12" fill="${theme.footer}">${e(rangeLabel)}</text>`;
}

function cardFooter(w: number, h: number, pl: number, pb: number, theme: Theme, host: string): string {
  const lineY = h - pb - 40;
  const ty = lineY + 20;
  return `
  <line x1="${pl}" y1="${lineY}" x2="${w - pl}" y2="${lineY}" stroke="${theme.divider}" stroke-width="1"/>
  <text x="${pl}" y="${ty}" dominant-baseline="central" font-size="12" fill="${theme.footer}">${e(host)}</text>
  <circle cx="${w - pl - 112}" cy="${ty}" r="3" fill="${theme.accent}"/>
  <text x="${w - pl - 104}" y="${ty}" dominant-baseline="central" font-size="12" fill="${theme.footer}">Generated with SpotiStats</text>`;
}

// ─── Classic Card (1200×630) ──────────────────────────────────────────────────

async function buildClassicCard(
  w: number, h: number,
  user: User, tracks: Track[], artists: Artist[], genres: Genre[],
  theme: Theme, rangeLabel: string, host: string,
): Promise<string> {
  const pl = 56, pt = 52, pb = 52;
  const top5 = tracks.slice(0, 5);
  const topArtist = artists[0];

  const [artistImg, ...trackImgs] = await Promise.all([
    fetchB64(topArtist?.imageUrl),
    ...top5.map(t => fetchB64(t.albumImageUrl)),
  ]);

  const contentY = pt + 44 + 44; // 140
  const divX = pl + 300 + 26;
  const rcX = pl + 300 + 52;

  let body = cardHeader(w, pl, pt, user, theme, rangeLabel);

  // ── Left: top artist ──────────────────────────────────────────────────────
  body += `
  <text x="${pl}" y="${contentY + 10}" font-size="10" font-weight="800" fill="${theme.accent}" letter-spacing="3">TOP ARTIST</text>`;

  const aY = contentY + 30;
  if (topArtist) {
    if (artistImg) {
      body += `
  <clipPath id="ac"><circle cx="${pl + 38}" cy="${aY + 38}" r="38"/></clipPath>
  <image href="${artistImg}" x="${pl}" y="${aY}" width="76" height="76" clip-path="url(#ac)" preserveAspectRatio="xMidYMid slice"/>`;
    } else {
      body += `<circle cx="${pl + 38}" cy="${aY + 38}" r="38" fill="${theme.track}"/>`;
    }
    body += `
  <text x="${pl + 92}" y="${aY + 20}" dominant-baseline="central" font-size="22" font-weight="800" fill="${theme.text}">${e(trunc(topArtist.artistName, 16))}</text>
  <text x="${pl + 92}" y="${aY + 52}" dominant-baseline="central" font-size="12" fill="${theme.sub}">${e(trunc(topArtist.genres.slice(0, 2).join(" · "), 28))}</text>`;
  }

  // ── Left: genres ──────────────────────────────────────────────────────────
  const gY = aY + 76 + 36;
  body += `
  <text x="${pl}" y="${gY}" font-size="10" font-weight="800" fill="${theme.accent}" letter-spacing="3">TOP GENRES</text>`;
  genres.slice(0, 4).forEach((g, i) => {
    const gy = gY + 22 + i * 28;
    body += `
  <text x="${pl + 16}" y="${gy}" text-anchor="end" dominant-baseline="central" font-size="11" font-weight="700" fill="${i === 0 ? theme.accent : theme.footer}">${i + 1}</text>
  <text x="${pl + 26}" y="${gy}" dominant-baseline="central" font-size="13" font-weight="${i === 0 ? 700 : 400}" fill="${i === 0 ? theme.text : theme.sub}">${e(trunc(g.genre, 22))}</text>`;
  });

  // ── Center divider ────────────────────────────────────────────────────────
  body += `
  <line x1="${divX}" y1="${contentY}" x2="${divX}" y2="${h - pb - 56}" stroke="${theme.divider}" stroke-width="1"/>`;

  // ── Right: tracks ─────────────────────────────────────────────────────────
  body += `
  <text x="${rcX}" y="${contentY + 10}" font-size="10" font-weight="800" fill="${theme.accent}" letter-spacing="3">TOP TRACKS</text>`;

  top5.forEach((track, i) => {
    const ty = contentY + 30 + i * 62;
    const img = trackImgs[i];
    body += `
  <text x="${rcX + 22}" y="${ty + 24}" text-anchor="end" dominant-baseline="central" font-size="13" font-weight="800" fill="${i === 0 ? theme.accent : theme.footer}">${i + 1}</text>`;
    if (img) {
      body += `
  <clipPath id="tc${i}"><rect x="${rcX + 36}" y="${ty}" width="48" height="48" rx="6"/></clipPath>
  <image href="${img}" x="${rcX + 36}" y="${ty}" width="48" height="48" clip-path="url(#tc${i})" preserveAspectRatio="xMidYMid slice"/>`;
    } else {
      body += `
  <rect x="${rcX + 36}" y="${ty}" width="48" height="48" rx="6" fill="${theme.track}"/>`;
    }
    body += `
  <text x="${rcX + 98}" y="${ty + 18}" font-size="15" font-weight="${i === 0 ? 800 : 600}" fill="${theme.text}">${e(trunc(track.trackName, 34))}</text>
  <text x="${rcX + 98}" y="${ty + 38}" font-size="12" fill="${theme.sub}">${e(trunc(track.artistNames.join(", "), 40))}</text>`;
  });

  body += cardFooter(w, h, pl, pb, theme, host);
  return svgDoc(w, h, theme, body);
}

// ─── Tracks Card (1200×630) ───────────────────────────────────────────────────

async function buildTracksCard(
  w: number, h: number,
  user: User, tracks: Track[],
  theme: Theme, rangeLabel: string, host: string,
): Promise<string> {
  const pl = 56, pt = 52, pb = 52;
  const col1 = tracks.slice(0, 4);
  const col2 = tracks.slice(4, 8);
  const imgs = await Promise.all([...col1, ...col2].map(t => fetchB64(t.albumImageUrl)));

  const contentY = pt + 44 + 44; // 140
  const colW = (w - pl * 2 - 20) / 2;
  const col2X = pl + colW + 20;
  const rowH = 70;
  const rowGap = 12;

  let body = cardHeader(w, pl, pt, user, theme, rangeLabel);

  function trackRow(
    track: Track, globalIdx: number, localIdx: number, colX: number, img: string | null,
  ): string {
    const ry = contentY + localIdx * (rowH + rowGap);
    const isTop = globalIdx === 0;
    let row = `
  <rect x="${colX}" y="${ry}" width="${colW}" height="${rowH}" rx="10" fill="${isTop ? theme.accent + "18" : theme.track}"/>
  <text x="${colX + 22}" y="${ry + rowH / 2}" text-anchor="end" dominant-baseline="central" font-size="13" font-weight="800" fill="${isTop ? theme.accent : theme.footer}">${globalIdx + 1}</text>`;
    if (img) {
      row += `
  <clipPath id="tr${globalIdx}"><rect x="${colX + 36}" y="${ry + 12}" width="46" height="46" rx="6"/></clipPath>
  <image href="${img}" x="${colX + 36}" y="${ry + 12}" width="46" height="46" clip-path="url(#tr${globalIdx})" preserveAspectRatio="xMidYMid slice"/>`;
    } else {
      row += `
  <rect x="${colX + 36}" y="${ry + 12}" width="46" height="46" rx="6" fill="${theme.divider}"/>`;
    }
    row += `
  <text x="${colX + 96}" y="${ry + 26}" font-size="14" font-weight="${isTop ? 800 : 600}" fill="${theme.text}">${e(trunc(track.trackName, 22))}</text>
  <text x="${colX + 96}" y="${ry + 48}" font-size="11" fill="${theme.sub}">${e(trunc(track.artistNames[0] ?? "", 26))}</text>`;
    return row;
  }

  col1.forEach((track, i) => { body += trackRow(track, i, i, pl, imgs[i]); });
  col2.forEach((track, i) => { body += trackRow(track, i + 4, i, col2X, imgs[4 + i]); });

  body += cardFooter(w, h, pl, pb, theme, host);
  return svgDoc(w, h, theme, body);
}

// ─── Artists Card (1200×630) ──────────────────────────────────────────────────

async function buildArtistsCard(
  w: number, h: number,
  user: User, artists: Artist[],
  theme: Theme, rangeLabel: string, host: string,
): Promise<string> {
  const pl = 56, pt = 52, pb = 52;
  const top5 = artists.slice(0, 5);
  const imgs = await Promise.all(top5.map(a => fetchB64(a.imageUrl)));

  const contentY = pt + 44 + 44; // 140
  const footerLineY = h - pb - 40;
  const artCenterY = Math.round((contentY + footerLineY) / 2) - 24;
  const slotW = (w - pl * 2) / 5;

  let body = cardHeader(w, pl, pt, user, theme, rangeLabel);

  top5.forEach((artist, i) => {
    const cx = Math.round(pl + slotW * i + slotW / 2);
    const r = i === 0 ? 64 : 48;
    const img = imgs[i];

    if (img) {
      body += `
  <clipPath id="art${i}"><circle cx="${cx}" cy="${artCenterY}" r="${r}"/></clipPath>
  <image href="${img}" x="${cx - r}" y="${artCenterY - r}" width="${r * 2}" height="${r * 2}" clip-path="url(#art${i})" preserveAspectRatio="xMidYMid slice"/>`;
    } else {
      body += `
  <circle cx="${cx}" cy="${artCenterY}" r="${r}" fill="${theme.track}"/>`;
    }
    body += `
  <circle cx="${cx}" cy="${artCenterY}" r="${r}" fill="none" stroke="${i === 0 ? theme.accent : theme.divider}" stroke-width="3"/>`;

    // Rank badge
    const badgeCx = cx + r - 10;
    const badgeCy = artCenterY + r - 10;
    body += `
  <circle cx="${badgeCx}" cy="${badgeCy}" r="14" fill="${i === 0 ? theme.accent : theme.footer}"/>
  <text x="${badgeCx}" y="${badgeCy + 1}" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="800" fill="${i === 0 ? "#000" : "#fff"}">${i + 1}</text>`;

    // Name + genre
    const nameY = artCenterY + r + 22;
    body += `
  <text x="${cx}" y="${nameY}" text-anchor="middle" dominant-baseline="central" font-size="${i === 0 ? 18 : 15}" font-weight="800" fill="${theme.text}">${e(trunc(artist.artistName, 14))}</text>
  <text x="${cx}" y="${nameY + 22}" text-anchor="middle" dominant-baseline="central" font-size="11" fill="${theme.sub}">${e(trunc(artist.genres[0] ?? "—", 18))}</text>`;
  });

  body += cardFooter(w, h, pl, pb, theme, host);
  return svgDoc(w, h, theme, body);
}

// ─── Compact Card (600×600) ───────────────────────────────────────────────────

async function buildCompactCard(
  w: number, h: number,
  user: User, tracks: Track[], artists: Artist[], genres: Genre[],
  theme: Theme, rangeLabel: string, host: string,
): Promise<string> {
  const p = 36;
  const top3 = tracks.slice(0, 3);
  const topArtist = artists[0];
  const topGenre = genres[0]?.genre ?? "—";

  const [artistImg, ...trackImgs] = await Promise.all([
    fetchB64(topArtist?.imageUrl),
    ...top3.map(t => fetchB64(t.albumImageUrl)),
  ]);

  const hcy = p + 18;
  let body = `
  <circle cx="${p + 18}" cy="${hcy}" r="18" fill="${theme.accent}"/>
  <text x="${p + 18}" y="${hcy + 1}" text-anchor="middle" dominant-baseline="central" font-size="18" fill="${theme.text}">&#9834;</text>
  <text x="${p + 50}" y="${hcy + 1}" dominant-baseline="central" font-size="22" font-weight="800" fill="${theme.text}">SpotiStats</text>
  <text x="${w - p}" y="${hcy - 7}" text-anchor="end" font-size="14" font-weight="700" fill="${theme.text}">${e(trunc(user.displayName, 16))}</text>
  <text x="${w - p}" y="${hcy + 11}" text-anchor="end" font-size="11" fill="${theme.footer}">${e(rangeLabel)}</text>`;

  // Top artist
  const artLabelY = hcy + 18 + 28;
  const artY = artLabelY + 20;
  body += `
  <text x="${p}" y="${artLabelY}" font-size="9" font-weight="800" fill="${theme.accent}" letter-spacing="3">TOP ARTIST</text>`;

  if (topArtist) {
    if (artistImg) {
      body += `
  <clipPath id="cac"><circle cx="${p + 36}" cy="${artY + 36}" r="36"/></clipPath>
  <image href="${artistImg}" x="${p}" y="${artY}" width="72" height="72" clip-path="url(#cac)" preserveAspectRatio="xMidYMid slice"/>
  <circle cx="${p + 36}" cy="${artY + 36}" r="36" fill="none" stroke="${theme.accent}" stroke-width="2"/>`;
    } else {
      body += `<circle cx="${p + 36}" cy="${artY + 36}" r="36" fill="${theme.track}"/>`;
    }
    body += `
  <text x="${p + 86}" y="${artY + 22}" dominant-baseline="central" font-size="26" font-weight="800" fill="${theme.text}">${e(trunc(topArtist.artistName, 16))}</text>
  <text x="${p + 86}" y="${artY + 52}" dominant-baseline="central" font-size="12" fill="${theme.sub}">${e(trunc(topArtist.genres.slice(0, 2).join(" · "), 28))}</text>`;
  }

  // Divider
  const divY = artY + 72 + 22;
  body += `
  <line x1="${p}" y1="${divY}" x2="${w - p}" y2="${divY}" stroke="${theme.divider}" stroke-width="1"/>`;

  // Top tracks
  const tracksLabelY = divY + 20;
  body += `
  <text x="${p}" y="${tracksLabelY}" font-size="9" font-weight="800" fill="${theme.accent}" letter-spacing="3">TOP TRACKS</text>`;

  top3.forEach((track, i) => {
    const ty = tracksLabelY + 18 + i * 52;
    const img = trackImgs[i];
    body += `
  <text x="${p + 18}" y="${ty + 20}" text-anchor="end" dominant-baseline="central" font-size="12" font-weight="800" fill="${i === 0 ? theme.accent : theme.footer}">${i + 1}</text>`;
    if (img) {
      body += `
  <clipPath id="ct${i}"><rect x="${p + 22}" y="${ty}" width="40" height="40" rx="4"/></clipPath>
  <image href="${img}" x="${p + 22}" y="${ty}" width="40" height="40" clip-path="url(#ct${i})" preserveAspectRatio="xMidYMid slice"/>`;
    } else {
      body += `
  <rect x="${p + 22}" y="${ty}" width="40" height="40" rx="4" fill="${theme.track}"/>`;
    }
    body += `
  <text x="${p + 70}" y="${ty + 14}" font-size="14" font-weight="${i === 0 ? 800 : 600}" fill="${theme.text}">${e(trunc(track.trackName, 22))}</text>
  <text x="${p + 70}" y="${ty + 33}" font-size="11" fill="${theme.sub}">${e(trunc(track.artistNames.join(", "), 26))}</text>`;
  });

  // Footer
  const footerLineY = h - p - 40;
  const fty = footerLineY + 20;
  body += `
  <line x1="${p}" y1="${footerLineY}" x2="${w - p}" y2="${footerLineY}" stroke="${theme.divider}" stroke-width="1"/>
  <text x="${p}" y="${fty}" dominant-baseline="central" font-size="9" fill="${theme.footer}" letter-spacing="2">TOP GENRE</text>
  <text x="${p}" y="${fty + 18}" dominant-baseline="central" font-size="13" font-weight="700" fill="${theme.accent}">${e(trunc(topGenre, 20))}</text>
  <text x="${w - p}" y="${fty + 9}" text-anchor="end" dominant-baseline="central" font-size="11" fill="${theme.footer}">${e(host)}</text>`;

  return svgDoc(w, h, theme, body);
}

// ─── Route ────────────────────────────────────────────────────────────────────

const RANGE_LABELS: Record<string, string> = {
  short_term: "Last 4 weeks",
  medium_term: "Last 6 months",
  long_term: "All time",
};

const DIMENSIONS: Record<string, { width: number; height: number }> = {
  classic: { width: 1200, height: 630 },
  tracks:  { width: 1200, height: 630 },
  artists: { width: 1200, height: 630 },
  compact: { width: 600,  height: 600  },
};

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params;
  const reqUrl = new URL(req.url);
  const { searchParams } = reqUrl;
  const host = reqUrl.host;

  const type     = searchParams.get("type")  ?? "classic";
  const themeKey = (searchParams.get("theme") ?? "ocean") as ThemeKey;
  const range    = searchParams.get("range") ?? "long_term";

  const theme        = CARD_THEMES[themeKey] ?? CARD_THEMES.ocean;
  const { width, height } = DIMENSIONS[type] ?? DIMENSIONS.classic;
  const rangeLabel   = RANGE_LABELS[range] ?? "All time";
  const spotifyUserId = userId as Id<"spotifyUsers">;

  const [tracks, artists, genres, user] = await Promise.all([
    client.query(api.tracks.getTopTracksPublic,  { spotifyUserId, timeRange: range }),
    client.query(api.artists.getTopArtistsPublic, { spotifyUserId, timeRange: range }),
    client.query(api.artists.getTopGenresPublic,  { spotifyUserId, timeRange: range }),
    client.query(api.users.getSpotifyUserPublic,  { spotifyUserId }),
  ]);

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  let svg: string;
  switch (type) {
    case "tracks":
      svg = await buildTracksCard(width, height, user, tracks, theme, rangeLabel, host);
      break;
    case "artists":
      svg = await buildArtistsCard(width, height, user, artists, theme, rangeLabel, host);
      break;
    case "compact":
      svg = await buildCompactCard(width, height, user, tracks, artists, genres, theme, rangeLabel, host);
      break;
    default:
      svg = await buildClassicCard(width, height, user, tracks, artists, genres, theme, rangeLabel, host);
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
