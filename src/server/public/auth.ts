import type { NextFunction, Request, Response } from 'express';
import { decodeProtectedHeader, importJWK, jwtVerify } from 'jose';

import { prisma } from '../prisma.js';
import { asAuthedRequest, sendError, sendInternalError } from './common.js';

const DEBUG_PUBLIC_AUTH =
  process.env.DEBUG_PUBLIC_AUTH === '1' || process.env.NODE_ENV !== 'production';

function maskToken(token: string | null) {
  if (!token) return 'null';
  if (token.length <= 12) return `${token.slice(0, 3)}...${token.slice(-2)}`;
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

function debugAuth(message: string, details?: Record<string, unknown>) {
  if (!DEBUG_PUBLIC_AUTH) return;
  if (details) {
    console.log(`[public-auth] ${message}`, details);
    return;
  }
  console.log(`[public-auth] ${message}`);
}

function readBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (!scheme || !token) {
    return null;
  }

  if (scheme.toLowerCase() !== 'bearer') {
    return null;
  }

  return token.trim();
}

function looksLikeJwt(token: string) {
  return token.split('.').length === 3;
}

function normalizeJwk(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const jwk = { ...(raw as Record<string, unknown>) };
  if (!('kty' in jwk) && typeof jwk.crv === 'string') {
    // Neon stores Ed25519 keys as minimal JWK payloads; jose expects kty.
    jwk.kty = 'OKP';
  }

  return jwk;
}

async function resolveAuthUserIdFromJwt(token: string, requestId: string) {
  if (!looksLikeJwt(token)) {
    debugAuth('token is not JWT-shaped', { requestId });
    return null;
  }

  try {
    const header = decodeProtectedHeader(token);
    const alg = typeof header.alg === 'string' ? header.alg : 'EdDSA';
    const headerKid = typeof header.kid === 'string' ? header.kid : null;

    debugAuth('attempting JWT verification', {
      requestId,
      alg,
      kid: headerKid,
    });

    const now = new Date();
    const keys = await prisma.jwks.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        publicKey: true,
      },
    });

    for (const keyRow of keys) {
      try {
        const parsed = JSON.parse(keyRow.publicKey) as unknown;
        const jwk = normalizeJwk(parsed);
        if (!jwk) {
          debugAuth('invalid JWK payload', { requestId, jwkId: keyRow.id });
          continue;
        }

        const jwkKid = typeof jwk.kid === 'string' ? jwk.kid : null;
        if (headerKid && jwkKid && headerKid !== jwkKid) {
          continue;
        }

        const cryptoKey = await importJWK(jwk, alg);
        const verified = await jwtVerify(token, cryptoKey, {
          algorithms: [alg],
        });

        const authUserId = typeof verified.payload.sub === 'string' ? verified.payload.sub : null;
        debugAuth('JWT verified', {
          requestId,
          jwkId: keyRow.id,
          authUserId,
          exp: verified.payload.exp ?? null,
        });

        if (authUserId) {
          return authUserId;
        }
      } catch (error) {
        debugAuth('JWT verify attempt failed', {
          requestId,
          jwkId: keyRow.id,
          message: error instanceof Error ? error.message : 'Unknown JWT error',
        });
      }
    }

    debugAuth('JWT verification failed for all keys', { requestId });
    return null;
  } catch (error) {
    debugAuth('JWT decode failed', {
      requestId,
      message: error instanceof Error ? error.message : 'Unknown decode error',
    });
    return null;
  }
}

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const authHeader = req.header('authorization');
  debugAuth('incoming request', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    hasAuthorizationHeader: Boolean(authHeader),
    authHeaderPrefix: authHeader ? authHeader.split(' ')[0] : null,
  });

  const token = readBearerToken(req.header('authorization'));
  if (!token) {
    debugAuth('missing bearer token', { requestId });
    return sendError(
      res,
      401,
      'UNAUTHORIZED',
      'Authorization bearer token is required'
    );
  }

  try {
    debugAuth('querying session', { requestId, token: maskToken(token) });
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    let authUserId = session?.userId ?? null;
    let resolvedSessionId = session?.id ?? null;

    if (!session) {
      debugAuth('session not found/expired, trying JWT fallback', {
        requestId,
        token: maskToken(token),
      });
      authUserId = await resolveAuthUserIdFromJwt(token, requestId);
      resolvedSessionId = authUserId ? 'jwt' : null;
    } else {
      debugAuth('session found', {
        requestId,
        sessionId: session.id,
        authUserId: session.userId,
      });
    }

    if (!authUserId) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired session');
    }

    const publicUser = await prisma.public_user.findUnique({
      where: {
        auth_user_id: authUserId,
      },
      select: {
        id: true,
      },
    });

    if (!publicUser) {
      debugAuth('public user mapping missing', {
        requestId,
        authUserId,
      });
      return sendError(
        res,
        403,
        'FORBIDDEN',
        'No mapped public user found for this authenticated session'
      );
    }

    asAuthedRequest(req).auth = {
      sessionId: resolvedSessionId ?? 'unknown',
      authUserId,
      publicUserId: publicUser.id,
    };

    debugAuth('request authorized', {
      requestId,
      sessionId: resolvedSessionId ?? 'unknown',
      authUserId,
      publicUserId: publicUser.id,
    });

    return next();
  } catch (error) {
    debugAuth('session validation threw', { requestId });
    return sendInternalError(res, 'Session validation failed', error);
  }
}
