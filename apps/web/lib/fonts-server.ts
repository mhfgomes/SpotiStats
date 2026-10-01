import type { CardFontDef } from "./fonts";

const fontBase64Cache = new Map<string, string>();

export async function getFontCss(fontDef: CardFontDef): Promise<string> {
  if (fontDef.type !== "embedded" || !fontDef.fontUrl || !fontDef.fontFamily) {
    return "";
  }

  try {
    let b64 = fontBase64Cache.get(fontDef.id);
    if (!b64) {
      const res = await fetch(fontDef.fontUrl, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        b64 = buf.toString("base64");
        fontBase64Cache.set(fontDef.id, b64);
      }
    }

    if (b64) {
      return `
    <style>
      @font-face {
        font-family: '${fontDef.fontFamily}';
        font-style: normal;
        font-weight: 400 800;
        src: url('data:font/woff2;base64,${b64}') format('woff2');
      }
    </style>`;
    }
  } catch {
    // If fetching fails, fallback gracefully to system font stack
  }

  return "";
}
