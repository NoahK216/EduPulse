import {z} from 'zod';

import type {ScenarioNode} from './scenarioNodeSchemas';
import {ScenarioNodeSchema} from './scenarioNodeSchemas';

export type ScenarioState = {
  currentNodeId: string;
  vars: Record<string, unknown>;
};

export type ScenarioEvent =
  | { type: 'NEXT_NODE'; nextId?: string; }

export type NodeRendererProps<N extends ScenarioNode = ScenarioNode> = {
  node: N;
  state: ScenarioState;
  dispatch: (event: ScenarioEvent) => void;
};

export const ScenarioSchema = z.object({
  scenarioVersion: z.number().int().positive(),
  id: z.string().min(1),
  title: z.string().min(1),
  startNodeId: z.string().min(1),
  nodes: z.array(ScenarioNodeSchema).min(1),
});

export type Scenario = z.infer<typeof ScenarioSchema>;
