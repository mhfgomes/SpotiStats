import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as
  | { convexUrl?: string; authUrl?: string }
  | undefined;

const authUrl = process.env.EXPO_PUBLIC_AUTH_URL ?? extra?.authUrl ?? '';

export const appConfig = {
  convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL ?? extra?.convexUrl ?? '',
  authUrl,
};

export const isAppConfigured = Boolean(appConfig.convexUrl && appConfig.authUrl);
