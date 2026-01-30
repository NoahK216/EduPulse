import {z} from 'zod';

const BaseNodeSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
});
export type BaseNode = z.infer<typeof BaseNodeSchema>;

export const VideoNodeSchema = BaseNodeSchema.extend({
  type: z.literal('video'),
  src: z.string().min(1),
  captionsSrc: z.string().optional(),
  autoplay: z.boolean().optional(),
});
export type VideoNode = z.infer<typeof VideoNodeSchema>;

export const FreeResponseNodeSchema = BaseNodeSchema.extend({
  type: z.literal('free_response'),
  prompt: z.string().min(1),
  placeholder: z.string().optional(),
  rubricId: z.string().min(1).optional(),
});
export type FreeResponseNode = z.infer<typeof FreeResponseNodeSchema>;

export const ChoiceNodeSchema = BaseNodeSchema.extend({
  type: z.literal('choice'),
  prompt: z.string().min(1),
  choices: z.array(z.object({id: z.string().min(1), label: z.string().min(1)}))
               .min(1),
});

export type ChoiceNode = z.infer<typeof ChoiceNodeSchema>;

export const ScenarioNodeSchema = z.discriminatedUnion('type', [
  VideoNodeSchema,
  FreeResponseNodeSchema,
  ChoiceNodeSchema,
]);

export type ScenarioNode = z.infer<typeof ScenarioNodeSchema>;
export type NodeType = ScenarioNode["type"];
