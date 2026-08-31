import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState, LoadingState, SignedOutState } from '@/components/spotify-state';
import { ArtistTile, GenreRow, RangePicker, SectionHeader, TrackRow } from '@/components/stats-ui';
import { colors, type } from '@/lib/theme';
import { useSpotifyData } from '@/providers/spotify-data';

export default function HomeScreen() {
  const { avatarUrl, data, error, isLoading, isSignedIn, name, range, refresh, setRange } = useSpotifyData();
  const stats = data[range];

  if (isLoading && !stats) return <LoadingState />;
  if (!isSignedIn) return <SignedOutState />;
  if (error && !stats) return <ErrorState message={error} retry={() => void refresh()} />;
  if (!stats) return <LoadingState />;

  const topArtist = stats.artists[0];
  const topTrack = stats.tracks[0];
  const topGenre = stats.genres[0];
  const maximumGenreCount = topGenre?.count ?? 1;
  const strongestTrait = [...stats.tasteProfile].sort((a, b) => b.value - a.value)[0];
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}><Text style={styles.brandNote}>♫</Text></View>
              <Text style={styles.brand}>SpotiStats</Text>
            </View>
            {avatarUrl ? <Image source={avatarUrl} contentFit="cover" style={styles.avatar} /> : <View style={styles.avatar}><Text style={styles.avatarText}>{initials || 'SS'}</Text></View>}
          </View>

          <View style={styles.greeting}>
            <Text style={styles.eyebrow}>YOUR LISTENING, DECODED</Text>
            <Text style={styles.title}>Made for {name.split(' ')[0]}</Text>
            <RangePicker fullWidth value={range} onChange={setRange} />
          </View>

          <View style={styles.auraCard}>
            {topArtist?.imageUrl ? <Image source={topArtist.imageUrl} blurRadius={32} contentFit="cover" style={styles.auraBackdrop} /> : null}
            <View style={styles.auraShade} />
            <View style={styles.auraTopline}>
              <Text style={styles.auraLabel}>YOUR #1 ARTIST</Text>
              <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
            </View>
            <View style={styles.auraBody}>
              {topArtist?.imageUrl ? <Image source={topArtist.imageUrl} contentFit="cover" style={styles.heroArtist} /> : null}
              <Text numberOfLines={2} style={styles.auraTitle}>{topArtist?.artistName ?? 'Your taste is taking shape'}</Text>
              <Text numberOfLines={1} style={styles.auraMeta}>{topArtist?.genres.slice(0, 3).join(' · ') || 'Keep listening'}</Text>
            </View>
          </View>

          <View style={styles.metrics}>
            <Metric label="TOP TRACK" value={topTrack?.trackName ?? '—'} />
            <View style={styles.metricRule} />
            <Metric label="TOP GENRE" value={topGenre?.genre ?? '—'} />
            <View style={styles.metricRule} />
            <Metric label="TASTE SIGNAL" value={`${strongestTrait?.value ?? 0}% ${strongestTrait?.axis ?? ''}`} />
          </View>

          <SectionHeader title="Top tracks" action={`TOP ${Math.min(5, stats.tracks.length)}`} />
          <View style={styles.listCard}>{stats.tracks.slice(0, 5).map((track) => <TrackRow compact key={track.trackSpotifyId} track={track} previousRank={stats.previousTrackRanks[track.trackSpotifyId]} />)}</View>

          <SectionHeader title="Top artists" action="SWIPE" />
          <ScrollView horizontal contentContainerStyle={styles.artistRail} showsHorizontalScrollIndicator={false}>
            {stats.artists.slice(0, 8).map((artist) => <ArtistTile artist={artist} key={artist.artistSpotifyId} />)}
          </ScrollView>

          <SectionHeader title="Your genre mix" action={`${stats.genres.length} GENRES`} />
          <View style={styles.genreCard}>{stats.genres.slice(0, 6).map((genre) => <GenreRow genre={genre} key={genre.genre} maximum={maximumGenreCount} previousRank={stats.previousGenreRanks[genre.genre]} />)}</View>

          <SectionHeader title="Taste profile" action="6 SIGNALS" />
          <View style={styles.tasteCard}>
            <View style={styles.tasteIntro}>
              <View><Text style={styles.tasteKicker}>STRONGEST AXIS</Text><Text style={styles.tasteLead}>{strongestTrait?.axis ?? 'Still emerging'}</Text></View>
              <Text style={styles.tasteScore}>{strongestTrait?.value ?? 0}</Text>
            </View>
            {stats.tasteProfile.map((point) => (
              <View key={point.axis} style={styles.axisRow}>
                <Text style={styles.axisLabel}>{point.axis}</Text>
                <View style={styles.axisTrack}><View style={[styles.axisFill, { width: `${point.value}%` as `${number}%` }]} /></View>
                <Text style={styles.axisValue}>{point.value}%</Text>
              </View>
            ))}
          </View>
          {error ? <Text style={styles.staleNotice}>Showing saved results · refresh failed</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text numberOfLines={2} style={styles.metricValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, safeArea: { flex: 1 }, content: { paddingHorizontal: 16, paddingBottom: 120 },
  header: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' }, brandNote: { color: colors.black, fontSize: 15, fontWeight: '900' },
  brand: { color: colors.text, fontSize: 17, fontWeight: '900', letterSpacing: -0.5 }, avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.text, fontSize: 10, fontWeight: '800' },
  greeting: { paddingTop: 16, gap: 13, paddingBottom: 22 }, eyebrow: { color: colors.green, fontFamily: type.data, fontSize: 9, fontWeight: '800', letterSpacing: 1.7 }, title: { color: colors.text, fontSize: 31, fontWeight: '900', letterSpacing: -1.2 },
  auraCard: { height: 370, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.card, padding: 20 }, auraBackdrop: { position: 'absolute', inset: 0, opacity: 0.78, transform: [{ scale: 1.25 }] }, auraShade: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.53)' },
  auraTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, auraLabel: { color: colors.text, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 }, livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: 'rgba(0,0,0,0.5)' }, liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green }, liveText: { color: colors.text, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  auraBody: { flex: 1, justifyContent: 'flex-end' }, heroArtist: { width: 124, height: 124, borderRadius: 62, borderWidth: 3, borderColor: colors.green, marginBottom: 18 }, auraTitle: { color: colors.text, fontSize: 34, lineHeight: 37, fontWeight: '900', letterSpacing: -1.3 }, auraMeta: { color: 'rgba(255,255,255,0.72)', fontSize: 12, marginTop: 8, textTransform: 'capitalize' },
  metrics: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 12, marginTop: 12, paddingVertical: 15, paddingHorizontal: 8 }, metric: { flex: 1, paddingHorizontal: 9 }, metricRule: { width: 1, backgroundColor: colors.border }, metricLabel: { color: colors.faint, fontSize: 7, fontWeight: '900', letterSpacing: 1 }, metricValue: { color: colors.text, fontSize: 11, lineHeight: 15, fontWeight: '800', marginTop: 6 },
  listCard: { backgroundColor: colors.card, borderRadius: 12, paddingVertical: 4 }, artistRail: { gap: 10, paddingRight: 16 }, genreCard: { backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5 },
  tasteCard: { backgroundColor: colors.card, borderRadius: 12, padding: 18 }, tasteIntro: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.border }, tasteKicker: { color: colors.green, fontSize: 8, fontWeight: '900', letterSpacing: 1.4 }, tasteLead: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: 5 }, tasteScore: { color: colors.green, fontSize: 42, lineHeight: 44, fontWeight: '900', letterSpacing: -2 },
  axisRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15 }, axisLabel: { color: colors.muted, width: 82, fontSize: 11 }, axisTrack: { flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }, axisFill: { height: '100%', backgroundColor: colors.green, borderRadius: 4 }, axisValue: { color: colors.text, fontFamily: type.data, fontSize: 10, width: 34, textAlign: 'right' }, staleNotice: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 18 },
});
