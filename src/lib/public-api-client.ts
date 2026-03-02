import { authClient } from './auth-client';
import type { PublicApiError } from '../types/publicApi';

const DEBUG_PUBLIC_API =
  Boolean(import.meta.env.DEV) || import.meta.env.VITE_DEBUG_PUBLIC_API === '1';

function maskToken(token: string | null) {
  if (!token) return 'null';
  if (token.length <= 12) return `${token.slice(0, 3)}...${token.slice(-2)}`;
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

function debugPublicApi(message: string, details?: Record<string, unknown>) {
  if (!DEBUG_PUBLIC_API) return;
  if (details) {
    console.debug(`[public-api] ${message}`, details);
    return;
  }
  console.debug(`[public-api] ${message}`);
}

function isPublicApiError(value: unknown): value is PublicApiError {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.error === 'string' && typeof record.message === 'string';
}

export class ApiRequestError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type SessionShape = {
  session?: {
    token?: string;
  };
} | null;

let cachedSessionToken: string | null = null;
let tokenResolverInFlight: Promise<string | null> | null = null;

function readSessionToken(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const session = record.session;
  if (!session || typeof session !== 'object') {
    return null;
  }

  const token = (session as Record<string, unknown>).token;
  return typeof token === 'string' && token.length > 0 ? token : null;
}

function unwrapSession(value: unknown): SessionShape {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  if ('data' in record) {
    return (record.data as SessionShape) ?? null;
  }

  return value as SessionShape;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function resolveSessionTokenFromClient(): Promise<string | null> {
  const sessionResult = (await authClient.getSession()) as unknown;
  const session = unwrapSession(sessionResult);
  const token = readSessionToken(session);
  debugPublicApi('getSession resolved', {
    hasSession: Boolean(session),
    token: maskToken(token),
  });
  return token;
}

async function resolveSessionTokenWithRetries(): Promise<string | null> {
  const maxAttempts = 8;
  const waitMs = 250;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    debugPublicApi('resolving token attempt', { attempt: attempt + 1, maxAttempts });
    const token = await resolveSessionTokenFromClient();
    if (token) {
      debugPublicApi('token resolved', { token: maskToken(token), attempt: attempt + 1 });
      return token;
    }

    if (attempt < maxAttempts - 1) {
      await sleep(waitMs);
    }
  }

  return null;
}

export async function resolvePublicApiToken(): Promise<string | null> {
  if (cachedSessionToken) {
    debugPublicApi('using cached token', { token: maskToken(cachedSessionToken) });
    return cachedSessionToken;
  }

  if (!tokenResolverInFlight) {
    debugPublicApi('starting token resolver');
    tokenResolverInFlight = resolveSessionTokenWithRetries()
      .then((token) => {
        if (token) {
          cachedSessionToken = token;
          debugPublicApi('token cached', { token: maskToken(token) });
        } else {
          debugPublicApi('token resolver finished without token');
        }
        return token;
      })
      .finally(() => {
        debugPublicApi('token resolver settled');
        tokenResolverInFlight = null;
      });
  } else {
    debugPublicApi('awaiting token resolver already in flight');
  }

  return tokenResolverInFlight;
}

export function clearPublicApiTokenCache() {
  debugPublicApi('clearing token cache', { priorToken: maskToken(cachedSessionToken) });
  cachedSessionToken = null;
}

export async function publicApiGet<T>(path: string, token: string): Promise<T> {
  debugPublicApi('request start', { path, token: maskToken(token) });
  const response = await fetch(path, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  debugPublicApi('request finished', { path, status: response.status, ok: response.ok });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let code: string | undefined;

    try {
      const json = (await response.json()) as unknown;
      if (isPublicApiError(json)) {
        message = json.message;
        code = json.error;
      }
    } catch {
      // Keep generic message if response body is not JSON.
    }

    if (response.status === 401) {
      clearPublicApiTokenCache();
    }

    debugPublicApi('request failed', { path, status: response.status, code, message });
    throw new ApiRequestError(response.status, message, code);
  }

  return (await response.json()) as T;
}
