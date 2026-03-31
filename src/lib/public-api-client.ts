import { authClient } from "./auth-client";
import type { PublicApiError } from "../types/publicApi";

const DEBUG_PUBLIC_API =
  Boolean(import.meta.env.DEV) || import.meta.env.VITE_DEBUG_PUBLIC_API === "1";

function maskToken(token: string | null) {
  if (!token) return "null";
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
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.error === "string" && typeof record.message === "string";
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

let cachedPublicApiToken: string | null = null;
let publicApiTokenResolverInFlight: Promise<string | null> | null = null;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function resolvePublicApiTokenFromClient(): Promise<string | null> {
  const { data, error } = await authClient.token();

  if (error) {
    const message = error.message || "Failed to retrieve auth token";
    debugPublicApi("token() failed", { message });
    throw new Error(message);
  }

  const token = data?.token ?? null;
  debugPublicApi("token() resolved", {
    hasToken: Boolean(token),
    token: maskToken(token),
  });
  return token;
}

export async function resolvePublicApiToken(): Promise<string | null> {
  if (cachedPublicApiToken) {
    debugPublicApi("using cached token", {
      token: maskToken(cachedPublicApiToken),
    });
    return cachedPublicApiToken;
  }

  if (!publicApiTokenResolverInFlight) {
    debugPublicApi("starting token resolver");
    publicApiTokenResolverInFlight = (async () => {
      const maxAttempts = 8;
      const waitMs = 250;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        debugPublicApi("resolving token attempt", {
          attempt: attempt + 1,
          maxAttempts,
        });

        try {
          const token = await resolvePublicApiTokenFromClient();
          if (token) {
            cachedPublicApiToken = token;
            debugPublicApi("token cached", { token: maskToken(token) });
            return token;
          }
        } catch (error) {
          lastError =
            error instanceof Error
              ? error
              : new Error("Failed to retrieve auth token");
        }

        if (attempt < maxAttempts - 1) {
          await sleep(waitMs);
        }
      }

      if (lastError) {
        throw lastError;
      }

      debugPublicApi("token resolver finished without token");
      return null;
    })().finally(() => {
      debugPublicApi("token resolver settled");
      publicApiTokenResolverInFlight = null;
    });
  } else {
    debugPublicApi("awaiting token resolver already in flight");
  }

  return publicApiTokenResolverInFlight;
}

export function clearPublicApiTokenCache() {
  debugPublicApi("clearing token cache", {
    priorToken: maskToken(cachedPublicApiToken),
  });
  cachedPublicApiToken = null;
}

export async function publicApiGet<T>(path: string, token: string): Promise<T> {
  return publicApiRequest<T>(path, {
    method: "GET",
    token,
  });
}

export async function publicApiPost<T>(
  path: string,
  token: string,
  body: unknown,
): Promise<T> {
  return publicApiRequest<T>(path, {
    method: "POST",
    token,
    body,
  });
}

export async function publicApiDelete<T>(
  path: string,
  token: string,
): Promise<T> {
  return publicApiRequest<T>(path, {
    method: "DELETE",
    token,
  });
}

type PublicApiRequestArgs = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token: string;
  body?: unknown;
};

async function publicApiRequest<T>(
  path: string,
  args: PublicApiRequestArgs,
): Promise<T> {
  const { method, token, body } = args;
  debugPublicApi("request start", { path, token: maskToken(token) });
  const response = await fetch(path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(typeof body !== "undefined"
        ? { "Content-Type": "application/json" }
        : {}),
    },
    ...(typeof body !== "undefined" ? { body: JSON.stringify(body) } : {}),
  });

  debugPublicApi("request finished", {
    path,
    status: response.status,
    ok: response.ok,
  });

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

    debugPublicApi("request failed", {
      path,
      status: response.status,
      code,
      message,
    });
    throw new ApiRequestError(response.status, message, code);
  }

  return (await response.json()) as T;
}
