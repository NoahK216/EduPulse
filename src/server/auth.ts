import type { RequestHandler } from 'express';
import express from 'express';
import { getPool } from './db.js';

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

  const pool = getPool();

  try {
    const q = `
      SELECT s.id AS session_id, s."expiresAt", u.id AS auth_user_id, u.email, u.name, u.role AS auth_role, u.banned
      FROM neon_auth.session s
      JOIN neon_auth."user" u ON u.id = s."userId"
      WHERE s.token = $1 AND s."expiresAt" > now()
      LIMIT 1
    `;

    const r = await pool.query(q, [token]);
    if (r.rows.length === 0) return res.status(401).json({ error: 'Invalid or expired session' });

    const row = r.rows[0];
    if (row.banned) return res.status(403).json({ error: 'User is banned' });

    // Ensure there is a linked public user (no duplicates: match by email)
    const email = row.email;
    if (!email) return res.status(401).json({ error: 'Auth user has no email' });

    const pu = await pool.query('SELECT id, email, name, role FROM public.users WHERE email = $1', [email]);
    let publicUser = pu.rows[0];
    if (!publicUser) {
      // Map auth role to public role (restrict to allowed values)
      const allowed = new Set(['trainee', 'trainer', 'admin']);
      const role = allowed.has(row.auth_role) ? row.auth_role : 'trainee';

      const insert = await pool.query(
        'INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING id, email, name, role',
        [email, row.name || email.split('@')[0], role]
      );
      publicUser = insert.rows[0];
    }

    // Attach to request
    req.neon = {
      sessionId: row.session_id,
      authUserId: row.auth_user_id,
      email: row.email,
      name: row.name,
      authRole: row.auth_role,
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
