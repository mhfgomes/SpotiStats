import { expoClient } from '@better-auth/expo/client';
import { convexClient } from '@convex-dev/better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

import { appConfig } from '@/lib/config';

export const authClient = createAuthClient({
  baseURL: appConfig.authUrl || 'http://127.0.0.1:3000',
  basePath: '/api/auth',
  plugins: [
    expoClient({
      scheme: Constants.expoConfig?.scheme as string,
      storagePrefix: 'spotistats',
      storage: SecureStore,
    }),
    convexClient(),
  ],
});
