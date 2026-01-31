import express from 'express';
import OpenAI from 'openai';
import 'dotenv/config';
import { gradeRequestSchema, gradeWithOpenAI } from './grader';

const app = express();
app.use(express.json({ limit: '2mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/grade', async (req, res) => {
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

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => {
  console.log(`Rubric grader API listening on http://localhost:${port}`);
});
