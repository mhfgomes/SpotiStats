import { useAction, useConvexAuth } from 'convex/react';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { authClient } from '@/lib/auth-client';
import {
  getCurrentUserTopData,
  getCurrentUserRecentlyPlayed,
  initUserSync,
  type RecentlyPlayedItem,
  type SpotifyTopData,
  type TimeRange,
} from '@/lib/backend';

type RangeData = Partial<Record<TimeRange, SpotifyTopData>>;

interface SpotifyDataContextValue {
  data: RangeData;
  error: string | null;
  isLoading: boolean;
  isSignedIn: boolean;
  name: string;
  recent: RecentlyPlayedItem[];
  refresh: () => Promise<void>;
}

const SpotifyDataContext = createContext<SpotifyDataContextValue | null>(null);
const ranges: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

export function SpotifyDataProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const syncUser = useAction(initUserSync);
  const loadTopData = useAction(getCurrentUserTopData);
  const loadRecentlyPlayed = useAction(getCurrentUserRecentlyPlayed);
  const [data, setData] = useState<RangeData>({});
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [recent, setRecent] = useState<RecentlyPlayedItem[]>([]);

  const refresh = async () => {
    if (!isAuthenticated) return;
    setError(null);
    setIsFetching(true);
    try {
      await syncUser({});
      const [results, recentItems] = await Promise.all([
        Promise.all(ranges.map(async (timeRange) => [timeRange, await loadTopData({ timeRange })] as const)),
        loadRecentlyPlayed({ limit: 50 }),
      ]);
      setData(Object.fromEntries(results));
      setRecent(recentItems);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load your Spotify stats.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const timeout = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timeout);
    // The action references are stable for the lifetime of the Convex client.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isConvexLoading]);

  return (
    <SpotifyDataContext.Provider
      value={{
        data,
        error,
        isLoading: isPending || isConvexLoading || isFetching,
        isSignedIn: Boolean(session && isAuthenticated),
        name: session?.user.name ?? 'Listener',
        recent,
        refresh,
      }}>
      {children}
    </SpotifyDataContext.Provider>
  );
}

export function useSpotifyData() {
  const value = useContext(SpotifyDataContext);
  if (!value) throw new Error('useSpotifyData must be used inside SpotifyDataProvider.');
  return value;
}
