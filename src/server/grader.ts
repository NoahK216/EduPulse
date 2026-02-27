import express from 'express';
import OpenAI from 'openai';
import {z} from 'zod';

import {RubricSchema} from '../scenario/nodeSchemas.js';
import { prisma } from "./prisma.js";

// ---- Shared schemas/types (single source of truth) ----
export const rubricSchema = RubricSchema;

export const gradeRequestSchema = z.object({
  question_prompt: z.string().min(1, 'question_prompt is required'),
  user_response_text: z.string().min(1, 'user_response_text is required'),
  rubric: rubricSchema,
});

export const gradeResultSchema = z.object({
  bucket_id: z.string(),
  feedback: z.string(),
});

export type GradeRequest = z.infer<typeof gradeRequestSchema>;
export type Rubric = z.infer<typeof rubricSchema>;
export type GradeResult = z.infer<typeof gradeResultSchema>;

// JSON schema we give the model for structured output
export const gradeResultJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['bucket_id', 'feedback'],
  properties: {
    bucket_id: { type: 'string' },
    feedback: { type: 'string' },
  },
};

// ---- Prompts ----

const graderSystemPrompt = `You are an exacting rubric grader.
- You only return JSON that follows the provided schema.
- The rubric is defined by answer buckets. Each bucket has an id and classifier text.
- Choose the single best-fitting bucket and return its id.
- Return feedback: a brief explanation of what is missing compared to the best bucket/classifier, referencing the learner response.
- Keep feedback concise (2-4 sentences).`;

function buildGradeUserPrompt(params: {
  question_prompt: string;
  user_response_text: string;
  rubric: Rubric;
}) {
  const { question_prompt, user_response_text, rubric } = params;

  return [
    'Grade the learner response using the rubric answer buckets.',
    'Example bucket style: { "id": "1", "classifier": "Good Answer. plants take sunlight, use that sunlight and water and nutrients to make sugar, and break down that sugar to make energy." }',
    '',
    'Question prompt the learner answered:',
    question_prompt,
    '',
    'Rubric JSON (use this exactly):',
    JSON.stringify(rubric, null, 2),
    '',
    'Learner response:',
    user_response_text,
    '',
    'Instructions:',
    '- Select the single best answer bucket (classifier) that matches the response.',
    '- Return its bucket_id.',
    '- feedback: concise explanation of what is missing versus the best bucket, citing key phrases from the response.',
    'Return only the JSON that matches the schema.',
  ].join('\n');
}

// ---- Grading orchestration ----

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export async function gradeWithOpenAI(
  openai: OpenAI,
  body: GradeRequest,
  userId?: number,
  scenarioId?: string,
  nodeId?: string,
): Promise<GradeResult> {
  const responseFormat = {
    type: 'json_schema' as const,
    json_schema: { name: 'RubricGrade', schema: gradeResultJsonSchema, strict: true },
  };

  const messages = [
    { role: 'system' as const, content: graderSystemPrompt },
    { role: 'user' as const, content: buildGradeUserPrompt(body) },
  ];

  // First attempt
  const raw = await callModel(openai, messages, responseFormat);
  let parsed = parseModelJson(raw);

  // Retry once with fixer prompt if needed
  if (!parsed) {
    const fixed = await fixJson(openai, raw, responseFormat);
    parsed = parseModelJson(fixed);
  }

  if (!parsed) {
    throw new Error('Model did not return valid JSON after retry');
  }

  const result = enforceResult(parsed, body.rubric);
  const normalizedNodeId =
    typeof nodeId === 'string' && nodeId.length > 0 ? nodeId : 'unknown';

  // Save submission to database if userId and scenarioId provided
  if (userId !== undefined && scenarioId) {
    try {
      await prisma.submission.create({
        data: {
          user_id: userId,
          scenario_id: scenarioId,
          node_id: normalizedNodeId,
          question_prompt: body.question_prompt,
          user_response_text: body.user_response_text,
          bucket_id: result.bucket_id,
          feedback: result.feedback,
        },
      });
    } catch (error) {
      console.error('Failed to save submission:', error);
      // Don't fail the grading request if database save fails
    }
  }

  return result;

  if (!parsed) {
    throw new Error('Model did not return valid JSON after retry');
  }

  return enforceResult(parsed, body.rubric);
}

async function callModel(
  openai: OpenAI,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  responseFormat: OpenAI.Chat.Completions.ChatCompletionCreateParams['response_format'],
) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages,
    response_format: responseFormat,
  });

  return completion.choices[0]?.message?.content ?? '';
}

async function fixJson(
  openai: OpenAI,
  badJsonText: string,
  responseFormat: OpenAI.Chat.Completions.ChatCompletionCreateParams['response_format'],
) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content:
          'You repair malformed JSON so it matches the provided JSON schema exactly. Return JSON only.',
      },
      {
        role: 'user',
        content: [
          'JSON schema:',
          JSON.stringify(gradeResultJsonSchema, null, 2),
          '',
          'Malformed JSON:',
          badJsonText,
          '',
          'Return fixed JSON only.',
        ].join('\n'),
      },
    ],
    response_format: responseFormat,
  });

  return completion.choices[0]?.message?.content ?? '';
}

function parseModelJson(text: string | null | undefined) {
  if (!text) return null;
  try {
    const json = JSON.parse(text);
    const validated = gradeResultSchema.safeParse(json);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}

function enforceResult(aiResult: GradeResult, rubric: Rubric): GradeResult {
  // Ensure bucket_id is one of the rubric buckets; otherwise default to first bucket.
  const ids = new Set(rubric.answerBuckets.map((b) => b.id));
  const bucket_id = ids.has(aiResult.bucket_id)
    ? aiResult.bucket_id
    : rubric.answerBuckets[0]?.id ?? 'bucket';

  const feedback = aiResult.feedback || 'No feedback provided.';

  return { bucket_id, feedback };
}

export function createGraderRouter(openai: OpenAI) {
  const router = express.Router();

  router.post('/grade', async (req, res) => {
    const parsed = gradeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: 'Invalid request body', details: parsed.error.flatten() });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not set' });
    }

    try {
      const { userId, scenarioId, nodeId } = req.body;
      let parsedUserId: number | undefined;
      if (userId !== undefined && userId !== null) {
        const numericUserId = typeof userId === 'number' ? userId : Number(userId);
        if (!Number.isInteger(numericUserId)) {
          return res.status(400).json({ error: 'userId must be an integer' });
        }
        parsedUserId = numericUserId;
      }
      const parsedScenarioId = typeof scenarioId === 'string' ? scenarioId : undefined;

      const result = await gradeWithOpenAI(openai, parsed.data, parsedUserId, parsedScenarioId, nodeId);
      res.json(result);
    } catch (error) {
      console.error('Grading failed', error);
      res.status(502).json({
        error: 'Failed to grade response',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}
