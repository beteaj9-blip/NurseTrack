import { requireApiBaseUrl } from './config';
import { LoginResponse, User } from './types';

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type ApiOptions = RequestInit & {
  token?: string | null;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers, body, ...init } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`${requireApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(body && !isFormData ? { 'Content-Type': 'application/json' } : null),
        ...(token ? { Authorization: `Bearer ${token}` } : null),
        ...headers,
      },
      body,
    });
  } catch {
    throw new ApiError('Unable to reach NurseTrack services. Check your internet connection and try again.');
  }

  if (!response.ok) throw new ApiError(await readError(response), response.status);
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  const parsed = JSON.parse(text) as unknown;
  return parsed && typeof parsed === 'object' && 'data' in parsed ? (parsed as { data: T }).data : (parsed as T);
}

export function loginRequest(userId: string, password: string) {
  return apiFetch<LoginResponse>('/users/login', { method: 'POST', body: JSON.stringify({ userId, password }) });
}

export function getCurrentUser(token: string) {
  return apiFetch<User>('/users/me', { token });
}

export async function loadPreview(endpoint: string | undefined, token: string | null) {
  if (!endpoint) return null;
  try {
    const data = await apiFetch<unknown>(endpoint, { token });
    if (Array.isArray(data)) return { count: data.length, sample: data.slice(0, 3) };
    return data;
  } catch (error) {
    return { message: error instanceof Error ? error.message : 'Unable to load this screen.' };
  }
}

async function readError(response: Response) {
  const fallback = response.status === 401 ? 'Your session expired. Please sign in again.' : 'Request failed.';
  try {
    const text = await response.text();
    if (!text) return fallback;
    const parsed = JSON.parse(text) as { message?: string; error?: string };
    return parsed.message ?? parsed.error ?? text;
  } catch {
    return fallback;
  }
}
