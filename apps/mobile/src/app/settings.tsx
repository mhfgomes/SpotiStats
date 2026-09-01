import { Image } from 'expo-image';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkeletonLoader } from '@/components/skeleton-loader';
import { SignedOutState } from '@/components/spotify-state';
import { authClient } from '@/lib/auth-client';
import { getAccountPageData, revokeOtherSessions, revokeSession } from '@/lib/backend';
import { colors, type } from '@/lib/theme';
import { useSpotifyData } from '@/providers/spotify-data';

type Feedback = { type: 'success' | 'error'; message: string } | null;

export default function SettingsScreen() {
  const { isSignedIn, refresh } = useSpotifyData();
  const account = useQuery(getAccountPageData, isSignedIn ? {} : 'skip');
  const revokeOthers = useMutation(revokeOtherSessions);
  const revokeOne = useMutation(revokeSession);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSession, setPendingSession] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  if (!isSignedIn) return <SignedOutState />;
  if (account === undefined) return <SkeletonLoader variant="settings" />;

  const user = account.authUser;
  const initials = (user?.name ?? 'Listener').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  const sync = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      await refresh();
      setFeedback({ type: 'success', message: 'Profile and listening data synced.' });
    } catch (cause) {
      setFeedback({ type: 'error', message: cause instanceof Error ? cause.message : 'Sync failed.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const reconnect = () => authClient.signIn.social({ provider: 'spotify', callbackURL: '/settings' });

  const signOut = () => Alert.alert('Sign out?', 'You will need to connect Spotify again to view your stats.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: () => void authClient.signOut() },
  ]);

  const signOutOthers = () => Alert.alert('Sign out other devices?', 'Every other active session will be revoked.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out devices', style: 'destructive', onPress: () => void (async () => {
      setFeedback(null);
      try {
        const result = await revokeOthers({});
        setFeedback({ type: 'success', message: result.revokedCount ? `Signed out ${result.revokedCount} other ${result.revokedCount === 1 ? 'device' : 'devices'}.` : 'No other devices were active.' });
      } catch (cause) {
        setFeedback({ type: 'error', message: cause instanceof Error ? cause.message : 'Could not revoke sessions.' });
      }
    })() },
  ]);

  const revoke = async (sessionId: string) => {
    setPendingSession(sessionId);
    setFeedback(null);
    try {
      const result = await revokeOne({ sessionId });
      setFeedback({ type: result.revoked ? 'success' : 'error', message: result.revoked ? 'Device signed out.' : 'That session is no longer active.' });
    } catch (cause) {
      setFeedback({ type: 'error', message: cause instanceof Error ? cause.message : 'Could not revoke session.' });
    } finally {
      setPendingSession(null);
    }
  };

  const otherSessions = account.sessions.filter((session) => !session.isCurrent);
  const datasets = [
    { label: 'Tracks', value: account.dataSummary.tracks.snapshotCount, mark: '♫' },
    { label: 'Artists', value: account.dataSummary.artists.snapshotCount, mark: '●' },
    { label: 'Genres', value: account.dataSummary.genres.snapshotCount, mark: '◫' },
  ];

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <View style={styles.brandRow}><View style={styles.brandIcon}><Text style={styles.brandNote}>♫</Text></View><Text style={styles.brand}>SpotiStats</Text></View>
            {user?.image ? <Image source={user.image} contentFit="cover" style={styles.topAvatar} /> : <View style={styles.topAvatar}><Text style={styles.topAvatarText}>{initials}</Text></View>}
          </View>
          <Text style={styles.kicker}>ACCOUNT & APP</Text>
          <Text style={styles.title}>Settings</Text>

          <View style={styles.card}>
            <View style={styles.profileRow}>
              {user?.image ? <Image source={user.image} contentFit="cover" style={styles.avatar} /> : <View style={styles.avatarFallback}><Text style={styles.avatarText}>{initials}</Text></View>}
              <View style={styles.profileCopy}>
                <Text numberOfLines={1} style={styles.profileName}>{user?.name ?? 'Listener'}</Text>
                <Text numberOfLines={1} style={styles.meta}>{user?.email ?? 'Account details unavailable'}</Text>
                <Text style={styles.smallMeta}>Member since {formatDate(user?.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <ActionButton disabled={isSyncing} label={isSyncing ? 'Syncing…' : 'Sync profile'} onPress={() => void sync()} />
              <ActionButton label="Sign out" onPress={signOut} secondary />
            </View>
          </View>

          {feedback ? <View style={[styles.feedback, feedback.type === 'error' && styles.feedbackError]}><Text style={[styles.feedbackText, feedback.type === 'error' && styles.feedbackTextError]}>{feedback.message}</Text></View> : null}

          <SectionTitle title="Spotify connection" />
          <View style={styles.card}>
            <View style={styles.connectionRow}>
              <View style={styles.spotifyIcon}><Text style={styles.spotifyMark}>♫</Text></View>
              <View style={styles.profileCopy}>
                <View style={styles.connectedLine}><Text style={styles.profileName}>{account.spotifyProfile?.displayName ?? 'Spotify'}</Text><View style={styles.connectedPill}><View style={styles.dot} /><Text style={styles.connectedText}>{account.spotifyAccount.connected ? 'CONNECTED' : 'DISCONNECTED'}</Text></View></View>
                <Text style={styles.meta}>{account.spotifyProfile?.spotifyId ?? 'No Spotify profile linked'}</Text>
              </View>
            </View>
            <ActionButton label={account.spotifyAccount.connected ? 'Reconnect Spotify' : 'Connect Spotify'} onPress={() => void reconnect()} />
          </View>

          <View style={styles.sectionHeading}><SectionTitle title={`Active sessions · ${account.sessions.length}`} />{otherSessions.length ? <Pressable onPress={signOutOthers}><Text style={styles.sectionAction}>SIGN OUT OTHERS</Text></Pressable> : null}</View>
          <View style={styles.cardFlush}>
            {account.sessions.map((session, index) => (
              <View key={`${session.id || 'session'}-${index}`} style={styles.sessionRow}>
                <View style={styles.deviceIcon}><Text style={styles.deviceMark}>▣</Text></View>
                <View style={styles.profileCopy}>
                  <View style={styles.connectedLine}><Text numberOfLines={1} style={styles.sessionName}>{session.deviceLabel}</Text>{session.isCurrent ? <Text style={styles.current}>THIS DEVICE</Text> : null}</View>
                  <Text style={styles.smallMeta}>Active {timeAgo(session.updatedAt)} · IP {session.ipAddressMasked ?? 'unavailable'}</Text>
                </View>
                {!session.isCurrent ? <Pressable disabled={pendingSession === session.id} onPress={() => void revoke(session.id)} style={styles.revokeButton}><Text style={styles.revokeText}>{pendingSession === session.id ? '…' : 'REVOKE'}</Text></Pressable> : null}
              </View>
            ))}
          </View>

          <SectionTitle title="Your data" />
          <View style={styles.dataCard}>
            {datasets.map((dataset, index) => <View key={dataset.label} style={[styles.dataset, index > 0 && styles.datasetBorder]}><Text style={styles.datasetMark}>{dataset.mark}</Text><Text style={styles.datasetValue}>{dataset.value}</Text><Text style={styles.datasetLabel}>{dataset.label} snapshots</Text></View>)}
          </View>
          <Text style={styles.lastSync}>{account.dataSummary.latestSyncedAt ? `Last synced ${formatDate(account.dataSummary.latestSyncedAt)}` : 'No data synced yet'}</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ActionButton({ disabled, label, onPress, secondary = false }: { disabled?: boolean; label: string; onPress: () => void; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.buttonSecondary, (pressed || disabled) && styles.buttonPressed]}>{disabled ? <ActivityIndicator color={colors.black} size="small" /> : null}<Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{label}</Text></Pressable>;
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function formatDate(value?: number | null) {
  return value == null ? 'Never' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(value);
}

function timeAgo(value: number) {
  const minutes = Math.max(0, Math.floor((Date.now() - value) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, safeArea: { flex: 1 }, content: { paddingHorizontal: 16, paddingTop: 26, paddingBottom: 120 },
  topBar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 }, brandIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' }, brandNote: { color: colors.black, fontSize: 15, fontWeight: '900' }, brand: { color: colors.text, fontSize: 17, fontWeight: '900', letterSpacing: -0.5 }, topAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, topAvatarText: { color: colors.text, fontSize: 11, fontWeight: '900' },
  kicker: { color: colors.green, fontFamily: type.data, fontSize: 9, fontWeight: '900', letterSpacing: 1.7 }, title: { color: colors.text, fontSize: 36, fontWeight: '900', letterSpacing: -1.4, marginTop: 10, marginBottom: 24 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, gap: 16 }, cardFlush: { backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 13 }, avatar: { width: 58, height: 58, borderRadius: 29 }, avatarFallback: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border }, avatarText: { color: colors.text, fontSize: 17, fontWeight: '900' }, profileCopy: { flex: 1, minWidth: 0 }, profileName: { color: colors.text, fontSize: 15, fontWeight: '800' }, meta: { color: colors.muted, fontSize: 11, marginTop: 4 }, smallMeta: { color: colors.faint, fontSize: 9, marginTop: 5 },
  buttonRow: { flexDirection: 'row', gap: 8 }, button: { minHeight: 42, borderRadius: 22, paddingHorizontal: 16, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.green }, buttonSecondary: { backgroundColor: colors.elevated }, buttonPressed: { opacity: 0.65 }, buttonText: { color: colors.black, fontSize: 12, fontWeight: '900' }, buttonTextSecondary: { color: colors.text },
  feedback: { marginTop: 10, borderRadius: 10, padding: 12, backgroundColor: 'rgba(30,215,96,0.12)', borderWidth: 1, borderColor: 'rgba(30,215,96,0.2)' }, feedbackError: { backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)' }, feedbackText: { color: colors.green, fontSize: 11 }, feedbackTextError: { color: '#FCA5A5' },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 28, marginBottom: 11 }, sectionHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }, sectionAction: { color: colors.green, fontFamily: type.data, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  connectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, spotifyIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(30,215,96,0.13)', alignItems: 'center', justifyContent: 'center' }, spotifyMark: { color: colors.green, fontSize: 19, fontWeight: '900' }, connectedLine: { flexDirection: 'row', alignItems: 'center', gap: 7 }, connectedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(30,215,96,0.12)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3 }, dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.green }, connectedText: { color: colors.green, fontSize: 7, fontWeight: '900' },
  sessionRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, deviceIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.elevated, alignItems: 'center', justifyContent: 'center' }, deviceMark: { color: colors.muted, fontSize: 16 }, sessionName: { color: colors.text, flexShrink: 1, fontSize: 12, fontWeight: '700' }, current: { color: colors.green, fontSize: 7, fontWeight: '900', letterSpacing: 0.5 }, revokeButton: { paddingHorizontal: 7, paddingVertical: 8 }, revokeText: { color: colors.muted, fontFamily: type.data, fontSize: 8, fontWeight: '800' },
  dataCard: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden' }, dataset: { flex: 1, alignItems: 'center', paddingVertical: 18, paddingHorizontal: 5 }, datasetBorder: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.border }, datasetMark: { color: colors.green, fontSize: 15 }, datasetValue: { color: colors.text, fontSize: 25, fontWeight: '900', marginTop: 7 }, datasetLabel: { color: colors.muted, fontSize: 8, marginTop: 3, textAlign: 'center' }, lastSync: { color: colors.faint, fontSize: 9, textAlign: 'center', marginTop: 10 },
});
