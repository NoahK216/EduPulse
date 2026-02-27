import express from 'express';

import { ScenarioSchema } from '../scenario/scenarioSchemas.js';
import { prisma } from "./prisma.js";

function parseUserId(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

// TODO Noah: I'll go through here and 

export function createScenarioRouter() {
  const router = express.Router();

  // Save scenario
  router.post('/', async (req, res) => {
    const { userId, scenario } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const parsedUserId = typeof userId === 'number' ? userId : Number(userId);
    if (!Number.isInteger(parsedUserId)) {
      return res.status(400).json({ error: 'userId must be an integer' });
    }

    // Validate scenario format
    const validation = ScenarioSchema.safeParse(scenario);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid scenario format', details: validation.error.flatten() });
    }

    const validScenario = validation.data;

    try {
      const savedScenario = await prisma.scenario.upsert({
        where: { id: validScenario.id },
        create: {
          id: validScenario.id,
          user_id: parsedUserId,
          title: validScenario.title,
          scenario_version: validScenario.scenarioVersion,
          content: validScenario,
        },
        update: {
          title: validScenario.title,
          scenario_version: validScenario.scenarioVersion,
          content: validScenario,
          updated_at: new Date(),
        },
        select: {
          id: true,
          user_id: true,
          title: true,
          created_at: true,
          updated_at: true,
        },
      });

      res.json({ scenario: savedScenario });
    } catch (error) {
      console.error('Save scenario error:', error);
      res.status(500).json({ error: 'Failed to save scenario' });
    }
  });

  // Get user's scenarios
  router.get('/user/:userId', async (req, res) => {
    const parsedUserId = parseUserId(req.params.userId);
    if (!parsedUserId) {
      return res.status(400).json({ error: 'userId must be an integer' });
    }

    try {
      const scenarios = await prisma.scenario.findMany({
        where: { user_id: parsedUserId },
        orderBy: { updated_at: "desc" },
        select: {
          id: true,
          title: true,
          scenario_version: true,
          created_at: true,
          updated_at: true,
        },
      });

      res.json({ scenarios });
    } catch (error) {
      console.error('Get scenarios error:', error);
      res.status(500).json({ error: 'Failed to get scenarios' });
    }
  });

  // Get scenario by ID
  router.get('/:scenarioId', async (req, res) => {
    const { scenarioId } = req.params;

    try {
      const scenarioRow = await prisma.scenario.findUnique({
        where: { id: scenarioId },
        select: {
          id: true,
          user_id: true,
          title: true,
          scenario_version: true,
          content: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!scenarioRow) {
        return res.status(404).json({ error: 'Scenario not found' });
      }

      res.json({ 
        scenario: {
          ...scenarioRow,
          content: scenarioRow.content,
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
    const parsedUserId = typeof userId === 'number' ? userId : Number(userId);
    if (!Number.isInteger(parsedUserId)) {
      return res.status(400).json({ error: 'userId must be an integer' });
    }

    try {
      const result = await prisma.scenario.deleteMany({
        where: { id: scenarioId, user_id: parsedUserId },
      });

      if (result.count === 0) {
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
