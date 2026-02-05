import {z} from 'zod';

import {GenericNodeSchema} from './nodes';

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

export const ScenarioSchema = z.object({
  scenarioVersion: z.number().int().positive(),
  id: z.string().min(1),
  title: z.string().min(1),
  startNodeId: z.string().min(1),
  nodes: z.array(GenericNodeSchema).min(1),
  edges: z.array(NodeEdgeSchema)
});
export type Scenario = z.infer<typeof ScenarioSchema>;
