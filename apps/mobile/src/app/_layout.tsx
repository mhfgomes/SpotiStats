import { DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ConvexReactClient } from 'convex/react';
import {
  ConvexBetterAuthProvider,
  type AuthClient,
} from '@convex-dev/better-auth/react';

import AppTabs from '@/components/app-tabs';
import { authClient } from '@/lib/auth-client';
import { appConfig, isAppConfigured } from '@/lib/config';
import { SpotifyDataProvider } from '@/providers/spotify-data';

const convex = new ConvexReactClient(
  appConfig.convexUrl || 'https://configuration-required.convex.cloud',
);

export default function TabLayout() {
  if (!isAppConfigured) {
    return (
      <View style={styles.configScreen}>
        <Text style={styles.configKicker}>CONFIGURATION REQUIRED</Text>
        <Text style={styles.configTitle}>Connect the mobile app to your backend.</Text>
        <Text style={styles.configCopy}>
          Add EXPO_PUBLIC_CONVEX_URL and EXPO_PUBLIC_AUTH_URL to apps/mobile/.env.local.
        </Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#121212', text: '#FFFFFF' } }}>
      <StatusBar style="light" />
      <ConvexBetterAuthProvider
        client={convex}
        authClient={authClient as unknown as AuthClient}>
        <SpotifyDataProvider>
          <AppTabs />
        </SpotifyDataProvider>
      </ConvexBetterAuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  configScreen: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 28 },
  configKicker: { color: '#1ED760', fontFamily: 'monospace', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  configTitle: { color: '#FFFFFF', fontSize: 38, lineHeight: 44, fontWeight: '900', marginTop: 14 },
  configCopy: { color: '#B3B3B3', fontSize: 15, lineHeight: 23, marginTop: 18 },
});
