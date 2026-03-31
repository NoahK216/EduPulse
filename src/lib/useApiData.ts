import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

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

export type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  unauthorized: boolean;
  refetch: () => void;
};

async function fetchPublicApiData<T>(path: string): Promise<T> {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

  debugUseApiData('run start', { requestId, path });

  const token = await resolvePublicApiToken();
  debugUseApiData('token resolved', {
    requestId,
    hasToken: Boolean(token),
  });

  if (!token) {
    debugUseApiData('marking unauthorized due to missing token', { requestId, path });
    throw new ApiRequestError(
      401,
      'You must be logged in to access this page',
      'UNAUTHORIZED',
    );
  }

  try {
    const result = await publicApiGet<T>(path, token);
    debugUseApiData('request success', { requestId, path });
    return result;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      debugUseApiData('api request error', {
        requestId,
        path,
        status: error.status,
        code: error.code,
        message: error.message,
      });
      throw error;
    }

    if (error instanceof Error) {
      debugUseApiData('generic error', { requestId, path, message: error.message });
      throw error;
    }

    debugUseApiData('unknown error', { requestId, path });
    throw new Error('Unknown request error');
  } finally {
    debugUseApiData('run finished', { requestId, path });
  }
}

export function useApiData<T>(path: string | null): ApiState<T> {
  useEffect(() => {
    if (!path) {
      debugUseApiData('missing path');
    }
  }, [path]);

  const query = useQuery({
    queryKey: ['public-api', path],
    queryFn: () => fetchPublicApiData<T>(path!),
    enabled: Boolean(path),
  });

  if (!path) {
    return {
      data: null,
      loading: false,
      error: null,
      unauthorized: false,
      refetch: () => {},
    };
  }

  const loading = query.isPending || (query.isFetching && typeof query.data === 'undefined');
  const error =
    query.error instanceof ApiRequestError
      ? query.error.message
      : query.error instanceof Error
        ? query.error.message
        : null;
  const unauthorized =
    query.error instanceof ApiRequestError && query.error.status === 401;

  return {
    data: query.data ?? null,
    loading,
    error,
    unauthorized,
    refetch: () => {
      void query.refetch();
    },
  };
}
