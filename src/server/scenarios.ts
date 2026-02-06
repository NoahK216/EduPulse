import express from 'express';
import { getPool } from './db.js';
import { ScenarioSchema, Scenario } from '../scenario/scenarioSchemas.js';

export function createScenarioRouter() {
  const router = express.Router();
  const pool = getPool();

  // Save scenario
  router.post('/', async (req, res) => {
    const { userId, scenario } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Validate scenario format
    const validation = ScenarioSchema.safeParse(scenario);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid scenario format', details: validation.error.flatten() });
    }

    const validScenario = validation.data;

    try {
      const result = await pool.query(
        `INSERT INTO scenarios (id, user_id, title, scenario_version, content)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           title = $3, scenario_version = $4, content = $5, updated_at = NOW()
         RETURNING id, user_id, title, created_at, updated_at`,
        [validScenario.id, userId, validScenario.title, validScenario.scenarioVersion, JSON.stringify(validScenario)]
      );

      res.json({ scenario: result.rows[0] });
    } catch (error) {
      console.error('Save scenario error:', error);
      res.status(500).json({ error: 'Failed to save scenario' });
    }
  });

  // Get user's scenarios
  router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
      const result = await pool.query(
        'SELECT id, title, scenario_version, created_at, updated_at FROM scenarios WHERE user_id = $1 ORDER BY updated_at DESC',
        [userId]
      );

      res.json({ scenarios: result.rows });
    } catch (error) {
      console.error('Get scenarios error:', error);
      res.status(500).json({ error: 'Failed to get scenarios' });
    }
  });

  // Get scenario by ID
  router.get('/:scenarioId', async (req, res) => {
    const { scenarioId } = req.params;

    try {
      const result = await pool.query(
        'SELECT id, user_id, title, scenario_version, content, created_at, updated_at FROM scenarios WHERE id = $1',
        [scenarioId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Scenario not found' });
      }

      const row = result.rows[0];
      res.json({ 
        scenario: {
          ...row,
          content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content
        }
      });
    } catch (error) {
      console.error('Get scenario error:', error);
      res.status(500).json({ error: 'Failed to get scenario' });
    }
  });

  // Delete scenario
  router.delete('/:scenarioId', async (req, res) => {
    const { scenarioId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    try {
      const result = await pool.query(
        'DELETE FROM scenarios WHERE id = $1 AND user_id = $2 RETURNING id',
        [scenarioId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Scenario not found or unauthorized' });
      }

      res.json({ message: 'Scenario deleted' });
    } catch (error) {
      console.error('Delete scenario error:', error);
      res.status(500).json({ error: 'Failed to delete scenario' });
    }
  });

  return router;
}
