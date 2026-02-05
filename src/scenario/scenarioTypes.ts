import {z} from 'zod';

import type {ScenarioNode} from './scenarioNodeSchemas';
import {ScenarioNodeSchema} from './scenarioNodeSchemas';

export const NodeEdgeSchema = z.object({
  id: z.string(), 
  from: z.object({
    nodeId: z.string(),
    // TODO we'll want some validation on these ports, they'll each start with an indicator char like c, a, etc
    port: z.string().optional()
  }),
  to: z.object({
    nodeId: z.string()
  }).optional()
});
export type NodeEdge = z.infer<typeof NodeEdgeSchema>;

// TODO ScenarioVars are on the chopping block, remove unless a reason for their existence becomes apparent
export type ScenarioVars = Record<string, unknown>;

export type ScenarioEvent =
  | { type: 'NEXT_NODE'; nextId?: string; }

export type NodeRendererProps<N extends ScenarioNode = ScenarioNode> = {
  node: N;
  edges: NodeEdge[];
  vars: ScenarioVars;
  dispatch: (event: ScenarioEvent) => void;
};

export const ScenarioSchema = z.object({
  scenarioVersion: z.number().int().positive(),
  id: z.string().min(1),
  title: z.string().min(1),
  startNodeId: z.string().min(1),
  nodes: z.array(ScenarioNodeSchema).min(1),
  edges: z.array(NodeEdgeSchema)
});
export type Scenario = z.infer<typeof ScenarioSchema>;
