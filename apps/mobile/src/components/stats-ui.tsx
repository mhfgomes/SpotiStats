import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { TimeRange, TopArtist, TopGenre, TopTrack } from '@/lib/backend';
import { colors, type } from '@/lib/theme';

export const rangeOptions: { key: TimeRange; label: string; shortLabel: string }[] = [
  { key: 'short_term', label: 'Last 4 weeks', shortLabel: '4 weeks' },
  { key: 'medium_term', label: 'Last 6 months', shortLabel: '6 months' },
  { key: 'long_term', label: 'All time', shortLabel: 'All time' },
];

export function RangePicker({ value, onChange }: { value: TimeRange; onChange: (value: TimeRange) => void }) {
  return (
    <View style={styles.rangePicker}>
      {rangeOptions.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.rangeButton, selected && styles.rangeButtonActive]}>
            <Text style={[styles.rangeText, selected && styles.rangeTextActive]}>{option.shortLabel}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function TrackRow({ track, compact = false, previousRank }: { track: TopTrack; compact?: boolean; previousRank?: number }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => void Linking.openURL(track.externalUrl)}
      style={({ pressed }) => [styles.row, compact && styles.rowCompact, pressed && styles.rowPressed]}>
      <Text style={styles.rank}>{track.rank}</Text>
      {track.albumImageUrl ? (
        <Image source={track.albumImageUrl} contentFit="cover" transition={160} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.imageFallback]}><Text style={styles.note}>♪</Text></View>
      )}
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={styles.rowTitle}>{track.trackName}</Text>
        <Text numberOfLines={1} style={styles.rowMeta}>{track.artistNames.join(', ')} · {track.albumName}</Text>
      </View>
      {previousRank ? <Movement current={track.rank} previous={previousRank} /> : <View style={styles.popularity}>
        <Text style={styles.popularityValue}>{track.popularity}</Text>
        <Text style={styles.popularityLabel}>POP</Text>
      </View>}
    </Pressable>
  );
}

export function ArtistTile({ artist }: { artist: TopArtist }) {
  return (
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(artist.externalUrl)} style={styles.artistTile}>
      {artist.imageUrl ? (
        <Image source={artist.imageUrl} contentFit="cover" transition={160} style={styles.artistImage} />
      ) : (
        <View style={[styles.artistImage, styles.imageFallback]}><Text style={styles.artistFallback}>♪</Text></View>
      )}
      <Text numberOfLines={1} style={styles.artistName}>{artist.artistName}</Text>
      <Text numberOfLines={1} style={styles.artistGenre}>{artist.genres[0] ?? 'Artist'}</Text>
    </Pressable>
  );
}

export function ArtistRow({ artist, previousRank }: { artist: TopArtist; previousRank?: number }) {
  return (
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(artist.externalUrl)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <Text style={styles.rank}>{artist.rank}</Text>
      {artist.imageUrl ? <Image source={artist.imageUrl} contentFit="cover" style={styles.artistRowImage} /> : <View style={[styles.artistRowImage, styles.imageFallback]} />}
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={styles.rowTitle}>{artist.artistName}</Text>
        <Text numberOfLines={1} style={styles.rowMeta}>{artist.genres.slice(0, 3).join(' · ') || 'No genres listed'}</Text>
      </View>
      {previousRank ? <Movement current={artist.rank} previous={previousRank} /> : <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}

export function GenreRow({ genre, maximum, previousRank }: { genre: TopGenre; maximum: number; previousRank?: number }) {
  const width = `${Math.max(4, Math.round((genre.count / Math.max(maximum, 1)) * 100))}%` as `${number}%`;
  return (
    <View style={styles.genreRow}>
      <View style={styles.genreTopline}>
        <Text style={styles.genreRank}>{String(genre.rank).padStart(2, '0')}</Text>
        <Text numberOfLines={1} style={styles.genreName}>{genre.genre}</Text>
        {previousRank ? <Movement current={genre.rank} previous={previousRank} /> : <Text style={styles.genreCount}>{genre.count}</Text>}
      </View>
      <View style={styles.genreTrack}><View style={[styles.genreFill, { width }]} /></View>
    </View>
  );
}

function Movement({ current, previous }: { current: number; previous: number }) {
  const delta = previous - current;
  if (delta === 0) return <Text style={styles.movementFlat}>—</Text>;
  return <View style={[styles.movement, delta < 0 && styles.movementDown]}><Text style={styles.movementText}>{delta > 0 ? '↑' : '↓'}{Math.abs(delta)}</Text></View>;
}

const styles = StyleSheet.create({
  rangePicker: { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: colors.card, borderRadius: 999, padding: 3, gap: 2 },
  rangeButton: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999 },
  rangeButtonActive: { backgroundColor: colors.text },
  rangeText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  rangeTextActive: { color: colors.black },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 32, marginBottom: 13 },
  sectionTitle: { color: colors.text, fontFamily: type.display, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  sectionAction: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, borderRadius: 8 },
  rowCompact: { minHeight: 64 },
  rowPressed: { backgroundColor: 'rgba(255,255,255,0.06)' },
  rank: { color: colors.muted, fontFamily: type.data, fontSize: 12, width: 22, textAlign: 'right' },
  cover: { width: 48, height: 48, borderRadius: 4, backgroundColor: colors.elevated },
  imageFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.elevated },
  note: { color: colors.muted, fontSize: 17 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  rowMeta: { color: colors.muted, fontSize: 11, marginTop: 4 },
  popularity: { width: 28, alignItems: 'center' },
  popularityValue: { color: colors.text, fontFamily: type.data, fontSize: 11 },
  popularityLabel: { color: colors.faint, fontSize: 7, fontWeight: '800', marginTop: 2 },
  artistTile: { width: 126, padding: 10, borderRadius: 8, backgroundColor: colors.card },
  artistImage: { width: 106, height: 106, borderRadius: 53, backgroundColor: colors.elevated },
  artistFallback: { color: colors.muted, fontSize: 25 },
  artistName: { color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 11 },
  artistGenre: { color: colors.muted, fontSize: 10, marginTop: 4, textTransform: 'capitalize' },
  artistRowImage: { width: 48, height: 48, borderRadius: 24 },
  chevron: { color: colors.muted, fontSize: 25, paddingHorizontal: 4 },
  genreRow: { paddingVertical: 11 },
  genreTopline: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  genreRank: { color: colors.faint, fontFamily: type.data, fontSize: 10, width: 22 },
  genreName: { color: colors.text, flex: 1, fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
  genreCount: { color: colors.green, fontFamily: type.data, fontSize: 11 },
  genreTrack: { height: 3, marginLeft: 34, marginTop: 9, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  genreFill: { height: '100%', backgroundColor: colors.green, borderRadius: 3 },
  movement: { minWidth: 31, borderRadius: 999, backgroundColor: 'rgba(30,215,96,0.14)', paddingHorizontal: 6, paddingVertical: 4, alignItems: 'center' },
  movementDown: { backgroundColor: 'rgba(255,255,255,0.08)' },
  movementText: { color: colors.green, fontFamily: type.data, fontSize: 9, fontWeight: '800' },
  movementFlat: { color: colors.faint, fontFamily: type.data, fontSize: 11, width: 28, textAlign: 'center' },
});
