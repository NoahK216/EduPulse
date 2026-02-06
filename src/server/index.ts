import 'dotenv/config';

import express from 'express';
import OpenAI from 'openai';
import path from 'path';

import {createGraderRouter} from './grader.js';

const app = express();
app.use(express.json({ limit: '2mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ! Use /api prefix for calls to backend
app.use('/api', createGraderRouter(openai));

const clientDist = path.resolve(process.cwd(), 'dist');

// Serve static files from the "dist" folder (built React app)
app.use(express.static(clientDist));

// Catch-all: send index.html for React Router to handle routes
app.get('*', (_, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => {
  console.log(`Rubric grader API listening on http://localhost:${port}`);
});
