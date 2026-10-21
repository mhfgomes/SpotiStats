"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Copy, ExternalLink, Globe, Lock } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { CARD_THEMES, THEME_SWATCHES, type CardThemeKey } from "@/lib/themes";
import { cn } from "@/lib/utils";
import type { FeedbackState } from "@/lib/account";
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
import { Skeleton } from "@/components/ui/skeleton";
import { PublicProfileView } from "@/components/public-profile/PublicProfileView";
import { NowPlayingCard } from "@/components/public-profile/NowPlayingCard";
import { ProfileBlocksEditor } from "@/components/public-profile/ProfileBlocksEditor";

type MyProfile = NonNullable<
  FunctionReturnType<typeof api.publicProfiles.getMyPublicProfile>
>;
type Draft = Omit<MyProfile, "exists" | "updatedAt" | "spotifyId">;

const BIO_MAX_LENGTH = 160;
function useDebounced<T>(value: T, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);
  return debounced;
}

function toDraft(profile: MyProfile): Draft {
  const { exists, updatedAt, spotifyId, ...draft } = profile;
  void exists;
  void updatedAt;
  void spotifyId;
  return draft;
}

function profileUrl(handle: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/u/${encodeURIComponent(handle)}`;
}

export function PublicProfileSettings() {
  const saved = useQuery(api.publicProfiles.getMyPublicProfile);
  if (saved === undefined) {
    return (
      <div className="mx-auto max-w-6xl space-y-5">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }
  if (saved === null) {
    return (
      <p className="text-sm text-spotify-subtext">
        Your Spotify profile is still being set up. Try again in a moment.
      </p>
    );
  }
  return <PublicProfileEditor key={saved.updatedAt ?? "new"} saved={saved} />;
}

function PublicProfileEditor({ saved }: { saved: MyProfile }) {
  const updateProfile = useMutation(api.publicProfiles.updateMyPublicProfile);
  const [draft, setDraft] = useState<Draft>(() => toDraft(saved));
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [copied, setCopied] = useState(false);

  const debouncedDraft = useDebounced(draft);
  const slugInput = (draft.slug ?? "").trim().toLowerCase();
  const debouncedSlug = (debouncedDraft.slug ?? "").trim().toLowerCase();
  const slugCheck = useQuery(
    api.publicProfiles.checkSlug,
    draft.linkType === "custom" && debouncedSlug ? { slug: debouncedSlug } : "skip"
  );
  const { enabled, ...previewArgs } = debouncedDraft;
  void enabled;
  const preview = useQuery(api.publicProfiles.previewMyPublicProfile, previewArgs);

  const handle =
    draft.linkType === "custom" && slugInput ? slugInput : saved.spotifyId;
  const savedHandle =
    saved.linkType === "custom" && saved.slug ? saved.slug : saved.spotifyId;
  const isDirty = JSON.stringify(draft) !== JSON.stringify(toDraft(saved));
  const slugError =
    draft.linkType !== "custom"
      ? null
      : !slugInput
        ? "Choose a handle."
        : slugCheck && !slugCheck.ok && debouncedSlug === slugInput
          ? slugCheck.reason
          : null;

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setFeedback(null);
  };

  const save = async (next: Draft = draft) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateProfile({ ...next, slug: next.slug || undefined });
      setFeedback({ type: "success", message: "Public profile saved." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Couldn't save profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEnabled = () => {
    const next = { ...draft, enabled: !draft.enabled };
    setDraft(next);
    void save(next);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl(savedHandle));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Visibility */}
      <section className="spotify-card flex flex-wrap items-center gap-4 px-5 py-5">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            saved.enabled ? "bg-spotify-green/15 text-spotify-green" : "bg-white/5 text-spotify-subtext"
          )}
        >
          {saved.enabled ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-white">
            {saved.enabled ? "Your profile is public" : "Your profile is private"}
          </h2>
          <p className="mt-0.5 truncate text-sm text-spotify-subtext">
            {saved.enabled
              ? profileUrl(savedHandle)
              : "Only you can see your stats. Turn this on to get a shareable page."}
          </p>
        </div>
        {saved.enabled && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/u/${encodeURIComponent(savedHandle)}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open
              </a>
            </Button>
          </div>
        )}
        <Button
          size="sm"
          variant={saved.enabled ? "outline" : "default"}
          onClick={toggleEnabled}
          disabled={isSaving || (!saved.enabled && Boolean(slugError))}
        >
          {saved.enabled ? "Make private" : "Make public"}
        </Button>
      </section>

      <div className="flex items-start gap-5 max-lg:flex-col">
        <aside className="w-80 shrink-0 space-y-5 max-lg:w-full">
          {/* Link */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Link</CardTitle>
              <CardDescription>
                The other form keeps working and redirects to the one you pick.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <RadioGroup
                value={draft.linkType}
                onValueChange={(value) => update("linkType", value as Draft["linkType"])}
                className="space-y-2"
              >
                <Label htmlFor="link-custom" className="flex cursor-pointer items-center gap-2.5">
                  <RadioGroupItem id="link-custom" value="custom" />
                  Custom handle
                </Label>
                <Label htmlFor="link-spotify" className="flex cursor-pointer items-center gap-2.5">
                  <RadioGroupItem id="link-spotify" value="spotifyId" />
                  Spotify ID
                </Label>
              </RadioGroup>

              {draft.linkType === "custom" ? (
                <div className="space-y-1.5">
                  <div className="flex items-center overflow-hidden rounded-md border border-white/10 bg-white/[0.03] focus-within:border-spotify-green/60">
                    <span className="pl-3 text-sm text-spotify-subtext">/u/</span>
                    <input
                      value={draft.slug ?? ""}
                      onChange={(event) =>
                        update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                      }
                      maxLength={30}
                      placeholder="your-handle"
                      aria-label="Custom handle"
                      aria-invalid={Boolean(slugError)}
                      className="min-w-0 flex-1 bg-transparent py-2 pr-3 text-sm text-white outline-none"
                    />
                  </div>
                  <p className={cn("text-xs", slugError ? "text-red-400" : "text-spotify-subtext")}>
                    {slugError ??
                      (slugCheck?.ok && debouncedSlug === slugInput ? "Available" : "3–30 characters")}
                  </p>
                </div>
              ) : (
                <p className="truncate rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-spotify-subtext">
                  /u/{saved.spotifyId}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Header</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-bio">Bio</Label>
                <textarea
                  id="profile-bio"
                  value={draft.bio ?? ""}
                  onChange={(event) => update("bio", event.target.value)}
                  maxLength={BIO_MAX_LENGTH}
                  rows={3}
                  placeholder="A line about your taste…"
                  className="w-full resize-none rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-spotify-green/60"
                />
                <p className="text-right text-xs text-spotify-subtext">
                  {(draft.bio ?? "").length}/{BIO_MAX_LENGTH}
                </p>
              </div>

              <Label htmlFor="toggle-avatar" className="flex cursor-pointer items-center gap-2.5">
                <Checkbox
                  id="toggle-avatar"
                  checked={draft.showAvatar}
                  onCheckedChange={(checked) => update("showAvatar", checked === true)}
                />
                Show profile picture
              </Label>
            </CardContent>
          </Card>

          {/* Blocks */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Blocks</CardTitle>
              <CardDescription>
                Build your page: pick what to show, each with its own time range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileBlocksEditor
                blocks={draft.blocks}
                onChange={(blocks) => update("blocks", blocks)}
              />
            </CardContent>
          </Card>

          {/* Theme */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={draft.theme}
                onValueChange={(value) => update("theme", value)}
                className="grid grid-cols-5 gap-2"
              >
                {THEME_SWATCHES.map((swatch) => (
                  <Label key={swatch.id} htmlFor={`profile-theme-${swatch.id}`} className="cursor-pointer" title={swatch.label}>
                    <RadioGroupItem id={`profile-theme-${swatch.id}`} value={swatch.id} className="sr-only" />
                    <div
                      className={cn(
                        "relative h-9 w-full overflow-hidden rounded-lg border border-white/10 transition-all",
                        draft.theme === swatch.id && "ring-2 ring-primary/70"
                      )}
                      style={{ background: `linear-gradient(135deg, ${swatch.bg1} 0%, ${swatch.bg2} 100%)` }}
                    >
                      <div className="absolute bottom-1 right-1 h-2 w-2 rounded-full" style={{ background: swatch.dot }} />
                      {draft.theme === swatch.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <Check className="h-4 w-4 text-white drop-shadow" />
                        </div>
                      )}
                    </div>
                    <span className="sr-only">{swatch.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => save()}
              disabled={!isDirty || isSaving || Boolean(slugError)}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
            {feedback && (
              <p className={cn("text-center text-xs", feedback.type === "error" ? "text-red-400" : "text-spotify-green")}>
                {feedback.message}
              </p>
            )}
          </div>
        </aside>

        {/* Preview */}
        <div className="min-w-0 flex-1 space-y-2 lg:sticky lg:top-6">
          <p className="text-xs text-spotify-subtext">
            Preview · <span className="text-white/70">/u/{handle}</span>
          </p>
          {preview ? (
            <div className="overflow-hidden rounded-xl border border-white/8">
              <PublicProfileView
                profile={preview}
                compact
                renderNowPlaying={() => (
                  <NowPlayingCard
                    theme={CARD_THEMES[preview.theme as CardThemeKey] ?? CARD_THEMES.midnight}
                    track={{
                      trackName: "Your current track",
                      artistNames: ["Shows live while you listen"],
                      albumImageUrl: null,
                      isPlaying: true,
                      progressMs: 72_000,
                      durationMs: 210_000,
                    }}
                  />
                )}
              />
            </div>
          ) : (
            <Skeleton className="h-[600px] w-full rounded-xl" />
          )}
        </div>
      </div>
    </div>
  );
}
