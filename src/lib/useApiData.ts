import { useEffect, useState } from 'react';

import { ApiRequestError, publicApiGet, resolvePublicApiToken } from './public-api-client';

const DEBUG_PUBLIC_API =
  Boolean(import.meta.env.DEV) || import.meta.env.VITE_DEBUG_PUBLIC_API === '1';

function debugUseApiData(message: string, details?: Record<string, unknown>) {
  if (!DEBUG_PUBLIC_API) return;
  if (details) {
    console.debug(`[useApiData] ${message}`, details);
    return;
  }
  console.debug(`[useApiData] ${message}`);
}

type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  unauthorized: boolean;
  refetch: () => void;
};

export function useApiData<T>(path: string | null): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

    if (!path) {
      debugUseApiData('missing path', { requestId });
      setData(null);
      setError('Missing request path');
      setUnauthorized(false);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const run = async () => {
      debugUseApiData('run start', { requestId, path });
      setLoading(true);
      setError(null);
      setUnauthorized(false);

      try {
        const token = await resolvePublicApiToken();
        debugUseApiData('token resolved', {
          requestId,
          hasToken: Boolean(token),
        });
        if (!token) {
          if (!cancelled) {
            setUnauthorized(true);
            setError('You must be logged in to access this page');
          }
          debugUseApiData('marking unauthorized due to missing token', { requestId, path });
          return;
        }

        const result = await publicApiGet<T>(path, token);
        if (!cancelled) {
          setData(result);
        }
        debugUseApiData('request success', { requestId, path });
      } catch (err) {
        if (cancelled) {
          debugUseApiData('request cancelled before error handling', { requestId, path });
          return;
        }

        if (err instanceof ApiRequestError) {
          setUnauthorized(err.status === 401);
          setError(err.message);
          debugUseApiData('api request error', {
            requestId,
            path,
            status: err.status,
            code: err.code,
            message: err.message,
          });
        } else if (err instanceof Error) {
          setError(err.message);
          debugUseApiData('generic error', { requestId, path, message: err.message });
        } else {
          setError('Unknown request error');
          debugUseApiData('unknown error', { requestId, path });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
        debugUseApiData('run finished', { requestId, path, cancelled });
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [path, refreshKey]);

  return {
    data,
    loading,
    error,
    unauthorized,
    refetch: () => setRefreshKey((value) => value + 1),
  };
}
