import type express from 'express';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

type ParseResult<T> = { ok: true; value: T } | { ok: false; message: string };

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export type AuthContext = {
  sessionId: string;
  authUserId: string;
  publicUserId: string;
};

export type AuthedRequest = express.Request & { auth: AuthContext };

export type Pagination = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

function readQueryString(
  query: express.Request['query'],
  key: string
): string | undefined {
  const value = (query as Record<string, unknown>)[key];
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }

  return undefined;
}

function parsePositiveInt(field: string, raw: string): ParseResult<number> {
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 1) {
    return {
      ok: false,
      message: `${field} must be a positive integer`,
    };
  }

  return { ok: true, value };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseUuid(field: string, raw: string): ParseResult<string> {
  if (!UUID_PATTERN.test(raw)) {
    return {
      ok: false,
      message: `${field} must be a valid UUID`,
    };
  }

  return { ok: true, value: raw };
}

export function parsePagination(
  query: express.Request['query']
): ParseResult<Pagination> {
  const rawPage = readQueryString(query, 'page');
  const rawPageSize = readQueryString(query, 'pageSize');

  let page = DEFAULT_PAGE;
  let pageSize = DEFAULT_PAGE_SIZE;

  if (rawPage) {
    const parsed = parsePositiveInt('page', rawPage);
    if (!parsed.ok) {
      return parsed;
    }
    page = parsed.value;
  }

  if (rawPageSize) {
    const parsed = parsePositiveInt('pageSize', rawPageSize);
    if (!parsed.ok) {
      return parsed;
    }
    pageSize = Math.min(parsed.value, MAX_PAGE_SIZE);
  }

  return {
    ok: true,
    value: {
      page,
      pageSize,
      skip: (page - 1) * pageSize,
      take: pageSize,
    },
  };
}

export function parseUuidParam(
  field: string,
  rawValue: string | undefined
): ParseResult<string> {
  if (!rawValue) {
    return { ok: false, message: `${field} is required` };
  }
  return parseUuid(field, rawValue);
}

export function parseStringParam(
  field: string,
  rawValue: string | undefined
): ParseResult<string> {
  if (!rawValue) {
    return { ok: false, message: `${field} is required` };
  }
  return { ok: true, value: rawValue };
}

export function parseOptionalUuidQuery(
  query: express.Request['query'],
  key: string
): ParseResult<string | undefined> {
  const rawValue = readQueryString(query, key);
  if (!rawValue) {
    return { ok: true, value: undefined };
  }
  return parseUuid(key, rawValue);
}

export function sendError(
  res: express.Response,
  status: number,
  error: ApiErrorCode,
  message: string
) {
  return res.status(status).json({ error, message });
}

export function sendInternalError(
  res: express.Response,
  context: string,
  error: unknown
) {
  console.error(context, error);
  return sendError(res, 500, 'INTERNAL_ERROR', 'Internal server error');
}

export function asAuthedRequest(req: express.Request): AuthedRequest {
  return req as unknown as AuthedRequest;
}
