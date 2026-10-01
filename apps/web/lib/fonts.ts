// Shared font definitions for stats cards

export type FontType = "system" | "embedded";

export interface CardFontDef {
  id: string;
  label: string;
  description: string;
  family: string;
  type: FontType;
  fontUrl?: string;
  fontFamily?: string;
}

export const CARD_FONTS = {
  sans: {
    id: "sans",
    label: "Sans",
    description: "System Sans",
    family:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    type: "system",
  },
  geist: {
    id: "geist",
    label: "Geist",
    description: "Vercel Sans",
    family: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
    type: "embedded",
    fontUrl:
      "https://fonts.gstatic.com/s/geist/v5/gyByhwUxId8gMEwcGFWNOITd.woff2",
    fontFamily: "Geist",
  },
  "geist-mono": {
    id: "geist-mono",
    label: "Geist Mono",
    description: "Vercel Mono",
    family: "'Geist Mono', ui-monospace, monospace",
    type: "embedded",
    fontUrl:
      "https://fonts.gstatic.com/s/geistmono/v6/or3nQ6H-1_WfwkMZI_qYFrcdmhHkjko.woff2",
    fontFamily: "Geist Mono",
  },
  excalifont: {
    id: "excalifont",
    label: "Excalifont",
    description: "Hand-drawn (Excalidraw)",
    family: "'Excalifont', cursive, sans-serif",
    type: "embedded",
    fontUrl:
      "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/fonts/Excalifont-Regular.woff2",
    fontFamily: "Excalifont",
  },
  mono: {
    id: "mono",
    label: "Mono",
    description: "Monospace Code",
    family:
      "ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
    type: "system",
  },
  serif: {
    id: "serif",
    label: "Serif",
    description: "Editorial Serif",
    family: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, Georgia, serif",
    type: "system",
  },
  rounded: {
    id: "rounded",
    label: "Rounded",
    description: "Rounded Sans",
    family:
      "'SF Pro Rounded', 'Arial Rounded MT Bold', 'Nunito', 'Quicksand', sans-serif",
    type: "system",
  },
  "space-grotesk": {
    id: "space-grotesk",
    label: "Space Grotesk",
    description: "Modern & Tech",
    family: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
    type: "embedded",
    fontUrl:
      "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff2",
    fontFamily: "Space Grotesk",
  },
  "jetbrains-mono": {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    description: "Developer Mono",
    family: "'JetBrains Mono', ui-monospace, monospace",
    type: "embedded",
    fontUrl:
      "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwgknk-4.woff2",
    fontFamily: "JetBrains Mono",
  },
  inter: {
    id: "inter",
    label: "Inter",
    description: "Clean Web Sans",
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    type: "embedded",
    fontUrl:
      "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2",
    fontFamily: "Inter",
  },
} as const;

export type CardFontKey = keyof typeof CARD_FONTS;

export const DEFAULT_FONT: CardFontKey = "sans";

export const FONT_OPTIONS: CardFontDef[] = [
  CARD_FONTS.sans,
  CARD_FONTS.geist,
  CARD_FONTS["geist-mono"],
  CARD_FONTS.excalifont,
  CARD_FONTS.mono,
  CARD_FONTS.serif,
  CARD_FONTS.rounded,
  CARD_FONTS["space-grotesk"],
  CARD_FONTS["jetbrains-mono"],
  CARD_FONTS.inter,
];

export function getCardFont(key?: string | null): CardFontDef {
  if (key && key in CARD_FONTS) {
    return CARD_FONTS[key as CardFontKey];
  }
  return CARD_FONTS[DEFAULT_FONT];
}
