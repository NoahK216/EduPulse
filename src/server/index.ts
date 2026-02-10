import 'dotenv/config';

import express from 'express';
import OpenAI from 'openai';
import path from 'path';

import {gradeRequestSchema, gradeWithOpenAI} from './grader.js';

const app = express();
app.use(express.json({ limit: '2mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ! Use /api prefix for calls to backend
app.post('/api/grade', async (req, res) => {
  const parsed = gradeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not set' });
  }

  try {
    const result = await gradeWithOpenAI(openai, parsed.data);
    res.json(result);
  } catch (error) {
    console.error('Grading failed', error);
    res.status(502).json({
      error: 'Failed to grade response',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

const clientDist = path.resolve(process.cwd(), 'dist');

// Serve static files from the "dist" folder (built React app)
app.use(express.static(clientDist));

// Express 5 requires named wildcards; this matches all non-API routes
app.get('/{*splat}', (_, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => {
  console.log(`Rubric grader API listening on http://localhost:${port}`);
});
