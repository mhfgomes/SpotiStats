"use server";

import { headers } from "next/headers";
import { getRecentlyPlayed } from "@/lib/spotify";
import type {
  SpotifyArtistSimple,
  SpotifyPlayHistoryItem,
} from "@/types/spotify";

const MAX_SPOTIFY_PAGE_SIZE = 50;
const MAX_HISTORY_ITEMS = 100;

export interface HistoryItem {
  trackSpotifyId: string;
  trackName: string;
  albumName: string;
  albumSpotifyId?: string;
  albumImageUrl?: string;
  artistNames: string[];
  artistSpotifyIds: string[];
  playedAt: number;
  contextType?: string;
  contextUri?: string;
}

function getRequestOrigin(requestHeaders: Headers) {
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "http://127.0.0.1:3000";
}

async function getSpotifyAccessToken() {
  const requestHeaders = await headers();
  const origin = getRequestOrigin(requestHeaders);
  const response = await fetch(`${origin}/api/auth/get-access-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Referer: `${origin}/history`,
      cookie: requestHeaders.get("cookie") ?? "",
    },
    body: JSON.stringify({ providerId: "spotify" }),
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to get Spotify access token: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as { accessToken?: string };
  if (!payload.accessToken) {
    throw new Error("Spotify access token missing from auth response.");
  }

  return payload.accessToken;
}

function mapHistoryItems(items: SpotifyPlayHistoryItem[]): HistoryItem[] {
  return items.map((item) => ({
    trackSpotifyId: item.track.id,
    trackName: item.track.name,
    albumName: item.track.album.name,
    albumSpotifyId: item.track.album.id,
    albumImageUrl: item.track.album.images[0]?.url,
    artistNames: item.track.artists.map((artist: SpotifyArtistSimple) => artist.name),
    artistSpotifyIds: item.track.artists.map((artist: SpotifyArtistSimple) => artist.id),
    playedAt: new Date(item.played_at).getTime(),
    contextType: item.context?.type,
    contextUri: item.context?.uri,
  }));
}

export async function getRecentlyPlayedHistory(limit = MAX_HISTORY_ITEMS) {
  const normalizedLimit = Math.max(1, Math.min(MAX_HISTORY_ITEMS, limit));
  const accessToken = await getSpotifyAccessToken();

  if (!accessToken) {
    return { items: [] as HistoryItem[], error: "Unauthorized" };
  }

  const items: SpotifyPlayHistoryItem[] = [];
  let before: string | undefined;

  while (items.length < normalizedLimit) {
    const pageSize = Math.min(MAX_SPOTIFY_PAGE_SIZE, normalizedLimit - items.length);
    const response = await getRecentlyPlayed(accessToken, pageSize, undefined, before);

    if (response.items.length === 0) {
      break;
    }

    items.push(...response.items);

    if (response.items.length < pageSize) {
      break;
    }

    const oldestItem = response.items[response.items.length - 1];
    const oldestPlayedAt = new Date(oldestItem.played_at).getTime();
    before = String(Math.max(0, oldestPlayedAt - 1));
  }

  return { items: mapHistoryItems(items.slice(0, normalizedLimit)), error: null };
}
