import { Pressable, StyleSheet, Text, View } from 'react-native';

import { authClient } from '@/lib/auth-client';

export function SignedOutState() {
  const connect = async () => {
    await authClient.signIn.social({ provider: 'spotify', callbackURL: '/' });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.logo}><Text style={styles.logoMark}>♫</Text></View>
      <Text style={styles.kicker}>YOUR MUSIC, IN CONTEXT</Text>
      <Text style={styles.title}>Every listen says something.</Text>
      <Text style={styles.copy}>
        Connect Spotify to explore your top tracks, artists, genres, and taste signals in one place.
      </Text>
      <Pressable accessibilityRole="button" onPress={connect} style={styles.button}>
        <View style={styles.spotifyDot}><Text style={styles.spotifyMark}>♫</Text></View>
        <Text style={styles.buttonText}>Connect Spotify</Text>
      </Pressable>
      <Text style={styles.privacy}>READ-ONLY ACCESS · TOKENS STAY ON THE SERVER</Text>
    </View>
  );
}

export function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>THE NEEDLE SKIPPED</Text>
      <Text style={styles.title}>Your Spotify data didn’t load.</Text>
      <Text style={styles.copy}>{message}</Text>
      <Pressable accessibilityRole="button" onPress={retry} style={styles.button}>
        <Text style={styles.buttonText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', paddingHorizontal: 28 },
  logo: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1ED760', alignItems: 'center', justifyContent: 'center' },
  logoMark: { color: '#000000', fontSize: 23, fontWeight: '900' },
  kicker: { color: '#1ED760', fontFamily: 'monospace', fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginTop: 22 },
  title: { color: '#FFFFFF', fontSize: 40, lineHeight: 44, fontWeight: '900', letterSpacing: -1.4, marginTop: 16, maxWidth: 420 },
  copy: { color: '#B3B3B3', fontSize: 15, lineHeight: 23, marginTop: 18, maxWidth: 420 },
  button: { alignSelf: 'flex-start', minHeight: 54, marginTop: 28, paddingHorizontal: 20, borderRadius: 27, backgroundColor: '#1ED760', flexDirection: 'row', alignItems: 'center', gap: 10 },
  buttonText: { color: '#000000', fontSize: 14, fontWeight: '900' },
  spotifyDot: { width: 25, height: 25, borderRadius: 13, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
  spotifyMark: { color: '#1ED760', fontSize: 14, fontWeight: '900' },
  privacy: { color: '#777777', fontFamily: 'monospace', fontSize: 8, letterSpacing: 0.7, marginTop: 14 },
});
