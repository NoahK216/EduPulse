import {z} from 'zod';

const BaseNodeSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
});
export type BaseNode = z.infer<typeof BaseNodeSchema>;

export const VideoNodeSchema = BaseNodeSchema.extend({
  type: z.literal('video'),
  src: z.string(),
  captionsSrc: z.string().optional(),
  autoplay: z.boolean().optional(),
  toNode: z.string().optional(),
});
export type VideoNode = z.infer<typeof VideoNodeSchema>;

export const FreeResponseNodeSchema = BaseNodeSchema.extend({
  type: z.literal('free_response'),
  prompt: z.string(),
  placeholder: z.string().optional(),
  rubricId: z.string().optional(),
  // No "toNode" here, transitions will be stored in the rubric
});
export type FreeResponseNode = z.infer<typeof FreeResponseNodeSchema>;

export const ChoiceNodeSchema = BaseNodeSchema.extend({
  type: z.literal('choice'),
  prompt: z.string(),
  choices: z.array(z.object({
              id: z.string(),
              label: z.string(),
              toNode: z.string().optional()
            })).min(1),
});
export type ChoiceNode = z.infer<typeof ChoiceNodeSchema>;

export const ScenarioNodeSchema = z.discriminatedUnion('type', [
  VideoNodeSchema,
  FreeResponseNodeSchema,
  ChoiceNodeSchema,
]);

export type ScenarioNode = z.infer<typeof ScenarioNodeSchema>;
export type NodeType = ScenarioNode['type'];
