"use client";

import { useCallback, useState } from "react";
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

export function NowPlayingCardPage() {
  const user = useQuery(api.users.getSpotifyUser);

  const [theme, setTheme] = useState<CardThemeKey>("ocean");
  const [previewKey, setPreviewKey] = useState(0);
  const [copied, setCopied] = useState<"url" | "md" | null>(null);
  const [wrapWithLink, setWrapWithLink] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const nowPlayingUrl = user
    ? `${baseUrl}/api/now-playing/${user._id}?theme=${theme}`
    : null;

  const mdSnippet = nowPlayingUrl
    ? wrapWithLink
      ? `[![Now Playing](${nowPlayingUrl})](${baseUrl})`
      : `![Now Playing](${nowPlayingUrl})`
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
          <Skeleton className="h-72 w-72 rounded-2xl" />
          <Skeleton className="h-72 flex-1 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-sm text-spotify-subtext">
          Real-time card showing what you&apos;re listening to - refreshes on every
          load. 800 × 200
        </p>
      </div>

      <div className="flex items-start gap-6 max-lg:flex-col">
        <aside className="w-72 shrink-0 max-lg:w-full">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Theme</CardTitle>
              <CardDescription>Choose the now-playing banner style.</CardDescription>
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
                    htmlFor={`now-playing-theme-${swatch.id}`}
                    className="cursor-pointer"
                  >
                    <RadioGroupItem
                      id={`now-playing-theme-${swatch.id}`}
                      value={swatch.id}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "rounded-xl border border-white/8 bg-white/[0.03] p-2 transition-all hover:border-white/15 hover:bg-white/[0.06]",
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
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Preview</CardTitle>
                <CardDescription>800 × 200 live banner</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">800 × 200</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewKey((key) => key + 1)}
                  title="Refresh preview"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                {nowPlayingUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white"
                  >
                    <a
                      href={nowPlayingUrl}
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
              {nowPlayingUrl ? (
                <div className="overflow-hidden rounded-xl border border-white/8 bg-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={`${nowPlayingUrl}-${previewKey}`}
                    src={nowPlayingUrl}
                    alt="Now playing preview"
                    className="w-full"
                    style={{ aspectRatio: "800/200" }}
                  />
                </div>
              ) : (
                <Skeleton
                  className="w-full rounded-xl"
                  style={{ aspectRatio: "800/200" }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Share</CardTitle>
              <CardDescription>Use the image URL or README snippet.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <Checkbox
                  id="now-playing-wrap-link"
                  checked={wrapWithLink}
                  onCheckedChange={(checked) => setWrapWithLink(checked === true)}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <Label htmlFor="now-playing-wrap-link">Link image back to SpotiStats</Label>
                  <p className="text-xs text-muted-foreground">
                    Controls whether the Markdown snippet wraps the image in a link.
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
                    {nowPlayingUrl ?? "-"}
                  </code>
                  <Button
                    onClick={() => nowPlayingUrl && copy(nowPlayingUrl, "url")}
                    disabled={!nowPlayingUrl}
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
                  Markdown
                </p>
                <div className="flex items-center gap-2 max-sm:flex-col">
                  <code className="min-w-0 flex-1 truncate rounded-xl border border-white/8 bg-black/30 px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                    {mdSnippet || "-"}
                  </code>
                  <Button
                    variant="secondary"
                    onClick={() => copy(mdSnippet, "md")}
                    disabled={!nowPlayingUrl}
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
