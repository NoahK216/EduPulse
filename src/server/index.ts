import 'dotenv/config';

import express from 'express';
import OpenAI from 'openai';
import path from 'path';

import { createGraderRouter } from './grader.js';

const app = express();
app.use(express.json({ limit: '2mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ! Use /api prefix for calls to backend
app.use('/api/grade', createGraderRouter(openai));

const clientDist = path.resolve(process.cwd(), 'dist');

// Serve static files from the "dist" folder (built React app)
app.use(express.static(clientDist));

// Express 5 requires named wildcards; this matches all non-API routes
app.get('/{*splat}', (_, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const port = Number(process.env.PORT) || 8787;

// Initialize database and start server
(async () => {
  try {
    app.listen(port, () => {
      console.log(`🚀 EduPulse API listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
