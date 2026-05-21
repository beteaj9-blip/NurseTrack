declare const process: {
  env: {
    EXPO_PUBLIC_BACKEND_API_URL?: string;
  };
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL?.replace(/\/+$/, '') ?? '';

export function requireApiBaseUrl() {
  if (!API_BASE_URL) throw new Error('Set EXPO_PUBLIC_BACKEND_API_URL in .env.');
  return API_BASE_URL;
}
