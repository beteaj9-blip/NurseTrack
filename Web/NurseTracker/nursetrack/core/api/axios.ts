import axios from 'axios';

// Points to the real backend nursetracker-api running on port 8080
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
