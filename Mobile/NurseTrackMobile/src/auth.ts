import * as SecureStore from 'expo-secure-store';

import { User } from './types';

const TOKEN_KEY = 'nursetrack-mobile-token';
const USER_KEY = 'nursetrack-mobile-user';

export async function saveSession(user: User, token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function loadSession() {
  const [token, rawUser] = await Promise.all([SecureStore.getItemAsync(TOKEN_KEY), SecureStore.getItemAsync(USER_KEY)]);
  if (!token || !rawUser) return null;

  try {
    return { token, user: JSON.parse(rawUser) as User };
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession() {
  await Promise.all([SecureStore.deleteItemAsync(TOKEN_KEY), SecureStore.deleteItemAsync(USER_KEY)]);
}
