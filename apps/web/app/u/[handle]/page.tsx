import { cache } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { PublicProfileView } from "@/components/public-profile/PublicProfileView";
import { NowPlayingWidget } from "@/components/public-profile/NowPlayingWidget";

const getProfile = cache((handle: string) =>
  fetchQuery(api.publicProfiles.getPublicProfileByHandle, { handle })
);

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getProfile(decodeURIComponent(handle));
  if (!profile) {
    return { title: "Profile not found — SpotiStats", robots: { index: false } };
  }

  const title = `${profile.displayName} on SpotiStats`;
  const description = profile.bio ?? `${profile.displayName}'s top music on SpotiStats.`;

  return {
    title,
    description,
    alternates: { canonical: `/u/${encodeURIComponent(profile.handle)}` },
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "profile",
      images: profile.avatarUrl ? [profile.avatarUrl] : undefined,
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle);
  const profile = await getProfile(handle);
  if (!profile) notFound();

  if (handle !== profile.handle) {
    redirect(`/u/${encodeURIComponent(profile.handle)}`);
  }

  return (
    <PublicProfileView
      profile={profile}
      renderNowPlaying={() => (
        <NowPlayingWidget handle={profile.handle} themeKey={profile.theme} />
      )}
    />
  );
}
