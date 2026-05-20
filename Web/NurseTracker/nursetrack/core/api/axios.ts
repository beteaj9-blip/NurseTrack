import axios from 'axios';
import { isTokenExpired, markSessionExpired } from '@/core/auth/session';
import { useAuthStore } from '@/core/store/authStore';

const API_BASE_URL = process.env.BACKEND_API_URL?.replace(/\/+$/, '');

if (!API_BASE_URL) {
  throw new Error('BACKEND_API_URL is not configured. Set it in .env.');
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

let isRedirectingForExpiredSession = false;

function isAuthUrl(url?: string) {
  return url?.includes('/users/login') || url?.includes('/users/register');
}

function endExpiredSession() {
  if (typeof window === 'undefined') return;
  if (isRedirectingForExpiredSession) return;
  isRedirectingForExpiredSession = true;
  markSessionExpired();
  localStorage.removeItem('nursetrack-auth');
  useAuthStore.getState().logout();
  window.location.replace('/?session=expired');
}

apiClient.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase() ?? 'GET';
  const hasBody = config.data !== undefined && config.data !== null;

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (typeof config.headers?.delete === 'function') {
      config.headers.delete('Content-Type');
    } else if (config.headers) {
      delete config.headers['Content-Type'];
    }
  } else if (config.headers && hasBody && method !== 'GET' && method !== 'HEAD') {
    config.headers['Content-Type'] = 'application/json';
  }
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('nursetrack-auth');
    try {
      const token = raw ? JSON.parse(raw)?.state?.token : null;
      if (token) {
        if (isTokenExpired(token, 15)) {
          localStorage.removeItem('nursetrack-auth');
          useAuthStore.getState().logout();
          if (!isAuthUrl(config.url)) {
            endExpiredSession();
            return Promise.reject(new axios.CanceledError('Session expired'));
          }
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      localStorage.removeItem('nursetrack-auth');
      useAuthStore.getState().logout();
    }
  }
  return config;
});

// Response interceptor — log errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = isAuthUrl(error.config?.url);

    // Only force-logout on 401s from authenticated routes, NOT from the login form itself
    if (error.response?.status === 401 && !isAuthEndpoint) {
      endExpiredSession();
    }
    return Promise.reject(error);
  }
);
