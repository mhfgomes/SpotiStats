"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Check,
  Code,
  ExternalLink,
  Link2,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { THEME_SWATCHES } from "@/lib/themes";
import type { CardThemeKey } from "@/lib/themes";

const BANNER_META = {
  classic: {
    label: "Classic",
    desc: "Top artist, genres, and tracks",
    size: "1200 × 630",
    aspect: "1200/630",
  },
  tracks: {
    label: "Tracks",
    desc: "8 top tracks in two columns",
    size: "1200 × 630",
    aspect: "1200/630",
  },
  artists: {
    label: "Artists",
    desc: "Top 5 artists with avatars",
    size: "1200 × 630",
    aspect: "1200/630",
  },
  compact: {
    label: "Compact",
    desc: "Square card for social media",
    size: "600 × 600",
    aspect: "1/1",
  },
} as const;

type BannerType = keyof typeof BANNER_META;

const RANGES = [
  { id: "short_term", label: "Last 4 weeks" },
  { id: "medium_term", label: "Last 6 months" },
  { id: "long_term", label: "All time" },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

interface BannerCardPageProps {
  type: BannerType;
}

export function BannerCardPage({ type }: BannerCardPageProps) {
  const user = useQuery(api.users.getSpotifyUser);

  const [theme, setTheme] = useState<CardThemeKey>("ocean");
  const [range, setRange] = useState<RangeId>("short_term");
  const [previewKey, setPreviewKey] = useState(0);
  const [copied, setCopied] = useState<"url" | "html" | "md" | null>(null);
  const [wrapWithLink, setWrapWithLink] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const meta = BANNER_META[type];

  const cardUrl = user
    ? `${baseUrl}/api/card/${user._id}?type=${type}&theme=${theme}&range=${range}`
    : null;

  const htmlSnippet = cardUrl
    ? wrapWithLink
      ? `<a href="${baseUrl}">\n  <img src="${cardUrl}" alt="${user?.displayName ?? "Spotify"} Stats" />\n</a>`
      : `<img src="${cardUrl}" alt="${user?.displayName ?? "Spotify"} Stats" />`
    : "";

  const mdSnippet = cardUrl
    ? wrapWithLink
      ? `[![${user?.displayName ?? "Spotify"} Stats](${cardUrl})](${baseUrl})`
      : `![${user?.displayName ?? "Spotify"} Stats](${cardUrl})`
    : "";

  const copy = useCallback((text: string, which: typeof copied) => {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  if (user === undefined) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="mt-2 flex gap-6">
          <Skeleton className="h-80 w-72 rounded-2xl" />
          <Skeleton className="h-80 flex-1 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-sm text-spotify-subtext">
          {meta.desc} - {meta.size}
        </p>
      </div>

      <div className="flex items-start gap-6 max-lg:flex-col">
        <aside className="w-72 shrink-0 space-y-4 max-lg:w-full">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Theme</CardTitle>
              <CardDescription>Choose the visual style for this card.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as CardThemeKey)}
                className="grid grid-cols-3 gap-2"
              >
                {THEME_SWATCHES.map((swatch) => (
                  <Label
                    key={swatch.id}
                    htmlFor={`theme-${type}-${swatch.id}`}
                    className="cursor-pointer"
                  >
                    <RadioGroupItem
                      id={`theme-${type}-${swatch.id}`}
                      value={swatch.id}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "group rounded-xl border border-white/8 bg-white/[0.03] p-2 transition-all hover:border-white/15 hover:bg-white/[0.06]",
                        theme === swatch.id &&
                          "border-primary/70 bg-primary/10 ring-1 ring-primary/40"
                      )}
                    >
                      <div
                        className="relative h-10 w-full overflow-hidden rounded-lg border border-white/10"
                        style={{
                          background: `linear-gradient(135deg, ${swatch.bg1} 0%, ${swatch.bg2} 100%)`,
                        }}
                      >
                        <div
                          className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full"
                          style={{ background: swatch.dot }}
                        />
                        {theme === swatch.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Check className="h-4 w-4 text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-2 text-center text-[11px] font-medium leading-none",
                          theme === swatch.id ? "text-white" : "text-muted-foreground"
                        )}
                      >
                        {swatch.label}
                      </p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Time range</CardTitle>
              <CardDescription>Pick which Spotify window to render.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={range}
                onValueChange={(value) => setRange(value as RangeId)}
                className="gap-2"
              >
                {RANGES.map((item) => (
                  <Label
                    key={item.id}
                    htmlFor={`range-${type}-${item.id}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors",
                      range === item.id
                        ? "border-primary/60 bg-primary/10 text-white"
                        : "border-white/8 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <RadioGroupItem
                      id={`range-${type}-${item.id}`}
                      value={item.id}
                    />
                    <span className="text-sm">{item.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Preview</CardTitle>
                <CardDescription>{meta.label} card output</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{meta.size}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewKey((key) => key + 1)}
                  title="Refresh preview"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                {cardUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white"
                  >
                    <a
                      href={cardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {cardUrl ? (
                <div className="overflow-hidden rounded-xl border border-white/8 bg-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={`${cardUrl}-${previewKey}`}
                    src={cardUrl}
                    alt="Stats card preview"
                    className="w-full"
                    style={{ aspectRatio: meta.aspect }}
                  />
                </div>
              ) : (
                <Skeleton
                  className="w-full rounded-xl"
                  style={{ aspectRatio: meta.aspect }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Share</CardTitle>
              <CardDescription>Copy a direct URL or embed snippet.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <Checkbox
                  id={`wrap-link-${type}`}
                  checked={wrapWithLink}
                  onCheckedChange={(checked) => setWrapWithLink(checked === true)}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <Label htmlFor={`wrap-link-${type}`}>Link image back to SpotiStats</Label>
                  <p className="text-xs text-muted-foreground">
                    Applies to the HTML and Markdown snippets.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Direct image URL
                </p>
                <div className="flex items-center gap-2 max-sm:flex-col">
                  <code className="min-w-0 flex-1 truncate rounded-xl border border-white/8 bg-black/30 px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                    {cardUrl ?? "-"}
                  </code>
                  <Button
                    onClick={() => cardUrl && copy(cardUrl, "url")}
                    disabled={!cardUrl}
                    className="rounded-xl max-sm:w-full"
                  >
                    {copied === "url" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Link2 className="h-3.5 w-3.5" />
                    )}
                    {copied === "url" ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  HTML embed
                </p>
                <div className="flex items-start gap-2 max-sm:flex-col">
                  <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre rounded-xl border border-white/8 bg-black/30 px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                    {htmlSnippet || "-"}
                  </pre>
                  <Button
                    variant="secondary"
                    onClick={() => copy(htmlSnippet, "html")}
                    disabled={!cardUrl}
                    className="rounded-xl max-sm:w-full"
                  >
                    {copied === "html" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Code className="h-3.5 w-3.5" />
                    )}
                    {copied === "html" ? "Copied!" : "HTML"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Markdown
                </p>
                <div className="flex items-center gap-2 max-sm:flex-col">
                  <code className="min-w-0 flex-1 truncate rounded-xl border border-white/8 bg-black/30 px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                    {mdSnippet || "-"}
                  </code>
                  <Button
                    variant="secondary"
                    onClick={() => copy(mdSnippet, "md")}
                    disabled={!cardUrl}
                    className="rounded-xl max-sm:w-full"
                  >
                    {copied === "md" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Code className="h-3.5 w-3.5" />
                    )}
                    {copied === "md" ? "Copied!" : "MD"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
