import axios from 'axios';

const API_BASE_URL = process.env.BACKEND_API_URL?.replace(/\/+$/, '');

if (!API_BASE_URL) {
  throw new Error('BACKEND_API_URL is not configured. Set it in .env.');
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

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
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      localStorage.removeItem('nursetrack-auth');
    }
  }
  return config;
});

// Response interceptor — log errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes('/users/login') ||
      error.config?.url?.includes('/users/register');

    // Only force-logout on 401s from authenticated routes, NOT from the login form itself
    if (error.response?.status === 401 && !isAuthEndpoint) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nursetrack-auth');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);
