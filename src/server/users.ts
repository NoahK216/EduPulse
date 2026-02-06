import express from 'express';
import { getPool } from './db.js';
import { z } from 'zod';

const UserRoleSchema = z.enum(['trainee', 'trainer', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export function createUserRouter() {
  const router = express.Router();
  const pool = getPool();

  // Create or get user (for login/signup)
  router.post('/login', async (req, res) => {
    const { email, name, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate role if provided
    const validRole = role && UserRoleSchema.safeParse(role).success ? role : 'trainee';

    try {
      // Try to find existing user
      const result = await pool.query(
        'SELECT id, email, name, role FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length > 0) {
        return res.json({ user: result.rows[0] });
      }

      // Create new user with role
      const newUser = await pool.query(
        'INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING id, email, name, role',
        [email, name || email.split('@')[0], validRole]
      );

      res.json({ user: newUser.rows[0] });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  // Create user (explicit creation for admins)
  router.post('/', async (req, res) => {
    const { email, name, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate role
    const validation = UserRoleSchema.safeParse(role);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid role. Must be: trainee, trainer, or admin' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING id, email, name, role',
        [email, name || email.split('@')[0], validation.data]
      );

      res.json({ user: result.rows[0] });
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Get user by ID
  router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
      const result = await pool.query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: result.rows[0] });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // List all users (admin only)
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
      );

      res.json({ users: result.rows });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ error: 'Failed to list users' });
    }
  });

  // Update user role
  router.put('/:userId/role', async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    const validation = UserRoleSchema.safeParse(role);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid role. Must be: trainee, trainer, or admin' });
    }

    try {
      const result = await pool.query(
        'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role',
        [validation.data, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: result.rows[0] });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({ error: 'Failed to update role' });
    }
  });

  return router;
}
