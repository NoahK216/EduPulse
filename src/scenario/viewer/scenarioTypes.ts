import {z} from 'zod';

import type {ScenarioNode} from './scenarioNodeSchemas';
import {ScenarioNodeSchema} from './scenarioNodeSchemas';

export type ScenarioState = {
  currentNodeId: string;
  vars: Record<string, unknown>;
};

export type ScenarioEvent =
  | { type: "VIDEO_ENDED" }
  | { type: "SUBMIT_FREE_RESPONSE"; text: string }
  | { type: "SELECT_CHOICE"; choiceId: string };

export type NodeRendererProps<N extends ScenarioNode = ScenarioNode> = {
  node: N;
  state: ScenarioState;
  dispatch: (event: ScenarioEvent) => void;
};

// export const TransitionSchema = z.object({
//   from: z.string().min(1),
//   on: z.string().min(1),  // event type or outcome tag
//   to: z.string().min(1),
//   // optional: guards / conditions later
// });

export const ScenarioSchema = z.object({
  scenarioVersion: z.number().int().positive(),
  id: z.string().min(1),
  title: z.string().min(1),
  startNodeId: z.string().min(1),
  nodes: z.array(ScenarioNodeSchema).min(1),
});

export type Scenario = z.infer<typeof ScenarioSchema>;
