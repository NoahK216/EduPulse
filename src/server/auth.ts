import type { RequestHandler } from 'express';
import express from 'express';
import { prisma } from "./db.js";

function getTokenFromReq(req: any): string | null {
  // Check Authorization header
  const auth = req.headers?.authorization;
  if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice('Bearer '.length).trim();
  }

  // Check cookie named 'neon-session' or 'neon-session-token'
  const cookie = req.headers?.cookie;
  if (cookie && typeof cookie === 'string') {
    const cookies = cookie.split(';').map((c: string) => c.trim());
    for (const c of cookies) {
      if (c.startsWith('neon-session=')) return decodeURIComponent(c.split('=')[1]);
      if (c.startsWith('neon-session-token=')) return decodeURIComponent(c.split('=')[1]);
    }
  }

  return null;
}

export const verifyNeonSession: RequestHandler = async (req: any, res, next) => {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  try {
    const session = await prisma.session.findFirst({
      where: { token, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            banned: true,
          },
        },
      },
    });
    if (!session)
      return res.status(401).json({ error: "Invalid or expired session" });

    const authUser = session.user;
    if (authUser.banned)
      return res.status(403).json({ error: "User is banned" });

    // Ensure there is a linked public user (no duplicates: match by email)
    const email = authUser.email;
    if (!email) return res.status(401).json({ error: 'Auth user has no email' });

    let publicUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!publicUser) {
      // Map auth role to public role (restrict to allowed values)
      const allowed = new Set(['trainee', 'trainer', 'admin']);
      const role =
        authUser.role && allowed.has(authUser.role) ? authUser.role : "trainee";

      publicUser = await prisma.user.create({
        data: {
          email,
          name: authUser.name || email.split("@")[0],
          role,
        },
        select: { id: true, email: true, name: true, role: true },
      });
    }

    // Attach to request
    req.neon = {
      sessionId: session.id,
      authUserId: authUser.id,
      email: authUser.email,
      name: authUser.name,
      authRole: authUser.role,
      publicUser,
    };

    next();
  } catch (error) {
    console.error('Auth verification failed', error);
    res.status(500).json({ error: 'Auth verification error' });
  }
};

export function createAuthRouter() {
  const router = express.Router();

  router.get('/me', verifyNeonSession, (req: any, res) => {
    res.json({ user: req.neon.publicUser, auth: { role: req.neon.authRole, email: req.neon.email } });
  });

  return router;
}

export default createAuthRouter;
