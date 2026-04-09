import {z} from 'zod';

const BaseNodeSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
});
export type BaseNode = z.infer<typeof BaseNodeSchema>;

export const TextNodeSchema = BaseNodeSchema.extend({
  type: z.literal("text"),
  title: z.string().optional(),
  text: z.string().optional(),
});
export type TextNode = z.infer<typeof TextNodeSchema>;

export const StartNodeSchema = BaseNodeSchema.extend({
  type: z.literal("start")
});
export type StartNode = z.infer<typeof StartNodeSchema>;

export const VideoNodeSchema = BaseNodeSchema.extend({
  type: z.literal('video'),
  src: z.string().optional(), // Can be file URL (uploaded) or YouTube URL
  srcType: z.enum(['file', 'youtube', 'url']).optional(), // Track source type
  youtubeId: z.string().optional(), // Extracted YouTube video ID for embeds
  captionsSrc: z.string().optional(),
  autoplay: z.boolean().optional(),
  uploadedBy: z.string().optional(), // User ID who uploaded (if applicable)
  uploadedAt: z.string().optional(), // ISO timestamp
});
export type VideoNode = z.infer<typeof VideoNodeSchema>;

export const RubricSchema = z.object({
  id: z.string().min(1),
  context: z.string(),
  answerBuckets: z.array(z.object({id: z.string(), classifier: z.string()}))
});
export type Rubric = z.infer<typeof RubricSchema>;

export const FreeResponseNodeSchema = BaseNodeSchema.extend({
  type: z.literal('free_response'),
  prompt: z.string(),
  placeholder: z.string().optional(),
  rubric: RubricSchema,
});
export type FreeResponseNode = z.infer<typeof FreeResponseNodeSchema>;

export const ChoiceNodeSchema = BaseNodeSchema.extend({
  type: z.literal('choice'),
  prompt: z.string(),
  choices: z.array(z.object({id: z.string(), label: z.string()})).min(1),
});
export type ChoiceNode = z.infer<typeof ChoiceNodeSchema>;

export const GenericNodeSchema = z.discriminatedUnion('type', [
  StartNodeSchema,
  TextNodeSchema,
  VideoNodeSchema,
  ChoiceNodeSchema,
  FreeResponseNodeSchema,
]);
export type GenericNode = z.infer<typeof GenericNodeSchema>;
export type NodeType = GenericNode['type'];

