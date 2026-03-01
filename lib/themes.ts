// Shared theme definitions — used by RecapCard, stats-card page, and /api/card route
// Themes ported from ghstats (github.com/mhfgomes/github-stats)

export const CARD_THEMES = {
  ocean: {
    bg: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    text: "#ffffff",   sub: "rgba(255,255,255,0.58)", accent: "#fbd38d",
    divider: "rgba(255,255,255,0.12)", footer: "rgba(255,255,255,0.32)",
    track: "rgba(255,255,255,0.07)",
  },
  midnight: {
    bg: "linear-gradient(135deg, #0f172a 0%, #1f2937 100%)",
    text: "#f8fafc",   sub: "rgba(248,250,252,0.52)", accent: "#a5b4fc",
    divider: "rgba(255,255,255,0.08)", footer: "rgba(248,250,252,0.28)",
    track: "rgba(255,255,255,0.04)",
  },
  sunset: {
    bg: "linear-gradient(135deg, #f7971e 0%, #ff416c 100%)",
    text: "#ffffff",   sub: "rgba(255,255,255,0.62)", accent: "#fff2cc",
    divider: "rgba(255,255,255,0.16)", footer: "rgba(255,255,255,0.38)",
    track: "rgba(255,255,255,0.09)",
  },
  lavender: {
    bg: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    text: "#ffffff",   sub: "rgba(255,255,255,0.62)", accent: "#fde047",
    divider: "rgba(255,255,255,0.15)", footer: "rgba(255,255,255,0.38)",
    track: "rgba(255,255,255,0.08)",
  },
  forest: {
    bg: "linear-gradient(135deg, #0f766e 0%, #22c55e 100%)",
    text: "#ecfdf5",   sub: "rgba(236,253,245,0.60)", accent: "#facc15",
    divider: "rgba(255,255,255,0.12)", footer: "rgba(236,253,245,0.38)",
    track: "rgba(255,255,255,0.07)",
  },
  claude: {
    bg: "linear-gradient(135deg, #B05730 0%, #9C87F5 100%)",
    text: "#C3C0B6",   sub: "rgba(195,192,182,0.62)", accent: "#D97757",
    divider: "rgba(195,192,182,0.16)", footer: "rgba(195,192,182,0.38)",
    track: "rgba(255,255,255,0.06)",
  },
  vercel: {
    bg: "linear-gradient(135deg, #FFAE04 0%, #2671F4 100%)",
    text: "#ffffff",   sub: "rgba(255,255,255,0.62)", accent: "#ffffff",
    divider: "rgba(255,255,255,0.18)", footer: "rgba(255,255,255,0.42)",
    track: "rgba(255,255,255,0.09)",
  },
  supabase: {
    bg: "linear-gradient(135deg, #4ADE80 0%, #60A5FA 100%)",
    text: "#E2E8F0",   sub: "rgba(226,232,240,0.62)", accent: "#1a7f4b",
    divider: "rgba(255,255,255,0.15)", footer: "rgba(226,232,240,0.40)",
    track: "rgba(255,255,255,0.08)",
  },
  stone: {
    bg: "linear-gradient(135deg, #334155 0%, #94a3b8 100%)",
    text: "#f8fafc",   sub: "rgba(248,250,252,0.58)", accent: "#f8fafc",
    divider: "rgba(255,255,255,0.14)", footer: "rgba(248,250,252,0.38)",
    track: "rgba(255,255,255,0.07)",
  },
} as const;

export type CardThemeKey = keyof typeof CARD_THEMES;
export type CardTheme = (typeof CARD_THEMES)[CardThemeKey];

/** Ordered list used by theme pickers in the UI */
export const THEME_SWATCHES = [
  { id: "ocean"    as CardThemeKey, label: "Ocean",    dot: "#fbd38d", bg1: "#1e3c72", bg2: "#2a5298" },
  { id: "midnight" as CardThemeKey, label: "Midnight", dot: "#a5b4fc", bg1: "#0f172a", bg2: "#1f2937" },
  { id: "sunset"   as CardThemeKey, label: "Sunset",   dot: "#fff2cc", bg1: "#f7971e", bg2: "#ff416c" },
  { id: "lavender" as CardThemeKey, label: "Lavender", dot: "#fde047", bg1: "#8b5cf6", bg2: "#ec4899" },
  { id: "forest"   as CardThemeKey, label: "Forest",   dot: "#facc15", bg1: "#0f766e", bg2: "#22c55e" },
  { id: "claude"   as CardThemeKey, label: "Claude",   dot: "#D97757", bg1: "#B05730", bg2: "#9C87F5" },
  { id: "vercel"   as CardThemeKey, label: "Vercel",   dot: "#ffffff", bg1: "#FFAE04", bg2: "#2671F4" },
  { id: "supabase" as CardThemeKey, label: "Supabase", dot: "#1a7f4b", bg1: "#4ADE80", bg2: "#60A5FA" },
  { id: "stone"    as CardThemeKey, label: "Stone",    dot: "#f8fafc", bg1: "#334155", bg2: "#94a3b8" },
] as const;
