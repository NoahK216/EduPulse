import { z } from 'zod';

// Shared enums
export const UserRoleSchema = z.enum(['trainee', 'trainer', 'admin']);

// Database row shapes (single source of truth)
export const UserRowSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  role: UserRoleSchema.default('trainee'),
  created_at: z.date(),
  updated_at: z.date(),
});
export type UserRow = z.infer<typeof UserRowSchema>;

export const ScenarioRowSchema = z.object({
  id: z.string(),
  user_id: z.number().int(),
  title: z.string(),
  scenario_version: z.number().int(),
  content: z.record(z.string(), z.any()), // stored JSONB
  created_at: z.date(),
  updated_at: z.date(),
});
export type ScenarioRow = z.infer<typeof ScenarioRowSchema>;

export const SubmissionRowSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  scenario_id: z.string(),
  node_id: z.string(),
  question_prompt: z.string(),
  user_response_text: z.string(),
  bucket_id: z.string().nullable().optional(),
  feedback: z.string().nullable().optional(),
  created_at: z.date(),
});
export type SubmissionRow = z.infer<typeof SubmissionRowSchema>;

// Rubric schema reused in grading
export const RubricSchema = z.object({
  id: z.string().min(1),
  context: z.string(),
  answerBuckets: z.array(z.object({ id: z.string(), classifier: z.string() })),
});
export type Rubric = z.infer<typeof RubricSchema>;

// Scenario content (server-safe: does not import React/TSX components)
export const ScenarioContentSchema = z.object({
  scenarioVersion: z.number().int().positive(),
  id: z.string().min(1),
  title: z.string().min(1),
  startNodeId: z.string().min(1),
  nodes: z.array(z.unknown()).min(1),
  edges: z.array(z.unknown()),
});
export type ScenarioContent = z.infer<typeof ScenarioContentSchema>;
