"use node";

import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { getRecentlyPlayed } from "../../lib/spotify";
import type { SpotifyPlayHistoryItem, SpotifyArtistSimple } from "../../types/spotify";
import type { Id } from "../_generated/dataModel";

export async function syncRecentlyPlayed(
  ctx: ActionCtx,
  spotifyUserId: Id<"spotifyUsers">,
  accessToken: string
) {
  const cursorResult = await ctx.runQuery(
    internal.syncStatus.getCursor,
    { spotifyUserId }
  );
  const cursor: string | undefined = cursorResult ?? undefined;

  const response = await getRecentlyPlayed(accessToken, 50, cursor);

  if (!response.items || response.items.length === 0) {
    return;
  }

  const historyItems = response.items.map((item: SpotifyPlayHistoryItem) => ({
    spotifyUserId,
    trackSpotifyId: item.track.id,
    trackName: item.track.name,
    albumName: item.track.album.name,
    albumSpotifyId: item.track.album.id,
    albumImageUrl: item.track.album.images[0]?.url,
    artistNames: item.track.artists.map((a: SpotifyArtistSimple) => a.name),
    artistSpotifyIds: item.track.artists.map((a: SpotifyArtistSimple) => a.id),
    playedAt: new Date(item.played_at).getTime(),
    contextType: item.context?.type,
    contextUri: item.context?.uri,
  }));

  // The newest item comes first; use its timestamp + 1ms as the next cursor
  const newestPlayedAt = new Date(response.items[0].played_at).getTime();
  const newCursor = String(newestPlayedAt + 1);

  await ctx.runMutation(internal.history.appendPlayHistory, {
    spotifyUserId,
    items: historyItems,
    newCursor,
  });
}
