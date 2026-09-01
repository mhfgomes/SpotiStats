import { Image } from 'expo-image';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkeletonLoader } from '@/components/skeleton-loader';
import { ErrorState, SignedOutState } from '@/components/spotify-state';
import { ArtistRow, GenreRow, RangePicker, TrackRow } from '@/components/stats-ui';
import type { RecentlyPlayedItem, SpotifyTopData } from '@/lib/backend';
import { colors, type } from '@/lib/theme';
import { useSpotifyData } from '@/providers/spotify-data';

type ViewKey = 'tracks' | 'artists' | 'genres' | 'taste' | 'history';
const views: { key: ViewKey; label: string }[] = [
  { key: 'tracks', label: 'Tracks' }, { key: 'artists', label: 'Artists' }, { key: 'genres', label: 'Genres' }, { key: 'taste', label: 'Taste' }, { key: 'history', label: 'Recent' },
];

export default function LibraryScreen() {
  const { data, error, isLoading, isSignedIn, range, recent, refresh, setRange } = useSpotifyData();
  const [view, setView] = useState<ViewKey>('tracks');
  const stats = data[range];

  if (isLoading && !stats) return <SkeletonLoader variant="library" />;
  if (!isSignedIn) return <SignedOutState />;
  if (error && !stats) return <ErrorState message={error} retry={() => void refresh()} />;
  if (!stats) return <SkeletonLoader variant="library" />;

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.kicker}>YOUR MUSIC LIBRARY</Text>
            <Text style={styles.title}>The full picture</Text>
            <Text style={styles.subtitle}>Every ranking and taste signal from your Spotify listening.</Text>
          </View>
          <View style={styles.stickyWrap}>
            <View style={styles.viewPicker}>
              {views.map((item) => {
                const selected = view === item.key;
                return (
                  <Pressable key={item.key} onPress={() => setView(item.key)} style={styles.viewButton}>
                    <Text style={[styles.viewText, selected && styles.viewTextActive]}>{item.label}</Text>
                    {selected ? <View style={styles.viewIndicator} /> : null}
                  </Pressable>
                );
              })}
            </View>
            {view !== 'taste' && view !== 'history' ? (
              <View style={styles.rangeWrap}>
                <RangePicker fullWidth value={range} onChange={setRange} />
              </View>
            ) : null}
          </View>
          <View style={styles.summary}><Text style={styles.summaryTitle}>{viewTitle(view)}</Text><Text style={styles.summaryCount}>{viewCount(stats, view, recent)}</Text></View>
          <View style={styles.results}>{renderView(stats, view, recent)}</View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function viewTitle(view: ViewKey) {
  return ({ tracks: 'Top tracks', artists: 'Top artists', genres: 'Genre distribution', taste: 'Taste profile', history: 'Recently played' })[view];
}

function viewCount(stats: SpotifyTopData, view: ViewKey, recent: RecentlyPlayedItem[]) {
  const count = view === 'tracks' ? stats.tracks.length : view === 'artists' ? stats.artists.length : view === 'genres' ? stats.genres.length : view === 'history' ? recent.length : stats.tasteProfile.length;
  return `${String(count).padStart(2, '0')} RESULTS`;
}

function renderView(stats: SpotifyTopData, view: ViewKey, recent: RecentlyPlayedItem[]) {
  if (view === 'tracks') return stats.tracks.map((track) => <TrackRow key={track.trackSpotifyId} track={track} previousRank={stats.previousTrackRanks[track.trackSpotifyId]} />);
  if (view === 'artists') return stats.artists.map((artist) => <ArtistRow artist={artist} key={artist.artistSpotifyId} previousRank={stats.previousArtistRanks[artist.artistSpotifyId]} />);
  if (view === 'genres') {
    const maximum = stats.genres[0]?.count ?? 1;
    return <View style={styles.genreResults}>{stats.genres.map((genre) => <GenreRow genre={genre} key={genre.genre} maximum={maximum} previousRank={stats.previousGenreRanks[genre.genre]} />)}</View>;
  }
  if (view === 'history') return recent.length ? recent.map((item) => <HistoryRow item={item} key={`${item.trackSpotifyId}-${item.playedAt}`} />) : <Text style={styles.empty}>Spotify has not returned any recently played tracks yet.</Text>;
  const strongest = [...stats.tasteProfile].sort((a, b) => b.value - a.value)[0];
  return (
    <View style={styles.tasteResults}>
      <View style={styles.tasteHero}>
        <Text style={styles.tasteEyebrow}>YOUR STRONGEST SIGNAL</Text>
        <Text style={styles.tasteName}>{strongest?.axis ?? 'Still emerging'}</Text>
        <Text style={styles.tasteNumber}>{strongest?.value ?? 0}%</Text>
      </View>
      {stats.tasteProfile.map((point) => (
        <View key={point.axis} style={styles.tasteAxis}>
          <View style={styles.tasteTopline}><Text style={styles.tasteLabel}>{point.axis}</Text><Text style={styles.tasteValue}>{point.value}%</Text></View>
          <View style={styles.tasteTrack}><View style={[styles.tasteFill, { width: `${point.value}%` as `${number}%` }]} /></View>
          <Text style={styles.tasteDescription}>{axisDescription(point.axis)}</Text>
        </View>
      ))}
    </View>
  );
}

function HistoryRow({ item }: { item: RecentlyPlayedItem }) {
  const played = new Date(item.playedAt);
  const time = played.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const day = played.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return (
    <Pressable onPress={() => void Linking.openURL(item.externalUrl)} style={({ pressed }) => [styles.historyRow, pressed && styles.historyPressed]}>
      {item.albumImageUrl ? <Image source={item.albumImageUrl} contentFit="cover" style={styles.historyCover} /> : <View style={styles.historyCover} />}
      <View style={styles.historyCopy}><Text numberOfLines={1} style={styles.historyTitle}>{item.trackName}</Text><Text numberOfLines={1} style={styles.historyMeta}>{item.artistNames.join(', ')} · {item.albumName}</Text></View>
      <View style={styles.historyTime}><Text style={styles.historyClock}>{time}</Text><Text style={styles.historyDay}>{day}</Text></View>
    </Pressable>
  );
}

function axisDescription(axis: string) {
  return ({
    Energy: 'High-tempo, high-intensity music across electronic, hip-hop, punk and metal.',
    Acoustic: 'Organic, unplugged sounds spanning folk, classical and singer-songwriter music.',
    Mood: 'Emotionally rich listening across soul, jazz, R&B and mellow sounds.',
    Experimental: 'Boundary-pushing music from progressive, psychedelic and ambient scenes.',
    Mainstream: 'Widely popular, polished music built for charts and radio.',
    Underground: 'Niche, independent and alternative scenes outside the mainstream.',
  } as Record<string, string>)[axis] ?? 'A signal inferred from the genres around your top artists.';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, safeArea: { flex: 1 }, content: { paddingBottom: 120 },
  header: { paddingHorizontal: 16, paddingTop: 28, paddingBottom: 24, gap: 13 }, kicker: { color: colors.green, fontFamily: type.data, fontSize: 9, fontWeight: '900', letterSpacing: 1.7 },
  title: { color: colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -1.4 }, subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, maxWidth: 340, marginBottom: 5 },
  stickyWrap: { backgroundColor: colors.background, paddingHorizontal: 16, paddingBottom: 10 }, viewPicker: { height: 48, flexDirection: 'row', backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 4 }, rangeWrap: { marginTop: 12 },
  viewButton: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }, viewText: { color: colors.muted, fontSize: 12, fontWeight: '700' }, viewTextActive: { color: colors.text }, viewIndicator: { position: 'absolute', bottom: 0, width: 24, height: 3, borderRadius: 3, backgroundColor: colors.green },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }, summaryTitle: { color: colors.text, fontSize: 20, fontWeight: '800' }, summaryCount: { color: colors.faint, fontFamily: type.data, fontSize: 9, letterSpacing: 1 },
  results: { marginHorizontal: 10, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 6, overflow: 'hidden' }, genreResults: { paddingHorizontal: 10 },
  tasteResults: { padding: 10 }, tasteHero: { minHeight: 190, borderRadius: 12, backgroundColor: colors.green, padding: 20, justifyContent: 'flex-end', marginBottom: 8 }, tasteEyebrow: { color: colors.black, fontSize: 8, fontWeight: '900', letterSpacing: 1.5 }, tasteName: { color: colors.black, fontSize: 35, fontWeight: '900', letterSpacing: -1.2, marginTop: 8 }, tasteNumber: { position: 'absolute', right: 18, top: 14, color: 'rgba(0,0,0,0.22)', fontSize: 72, fontWeight: '900', letterSpacing: -5 },
  tasteAxis: { backgroundColor: colors.card, padding: 16, borderRadius: 10, marginTop: 8 }, tasteTopline: { flexDirection: 'row', justifyContent: 'space-between' }, tasteLabel: { color: colors.text, fontSize: 15, fontWeight: '800' }, tasteValue: { color: colors.green, fontFamily: type.data, fontSize: 12 }, tasteTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 5, marginTop: 11, overflow: 'hidden' }, tasteFill: { height: '100%', backgroundColor: colors.green }, tasteDescription: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 10 },
  historyRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, borderRadius: 8 }, historyPressed: { backgroundColor: 'rgba(255,255,255,0.06)' }, historyCover: { width: 48, height: 48, borderRadius: 4, backgroundColor: colors.elevated }, historyCopy: { flex: 1, minWidth: 0 }, historyTitle: { color: colors.text, fontSize: 14, fontWeight: '700' }, historyMeta: { color: colors.muted, fontSize: 10, marginTop: 4 }, historyTime: { alignItems: 'flex-end' }, historyClock: { color: colors.text, fontFamily: type.data, fontSize: 10 }, historyDay: { color: colors.faint, fontSize: 8, marginTop: 3 }, empty: { color: colors.muted, fontSize: 13, lineHeight: 20, padding: 28, textAlign: 'center' },
});
