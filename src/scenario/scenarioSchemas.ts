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

export const NodeLayoutSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  locked: z.boolean().optional(),
});
export type NodeLayout = z.infer<typeof NodeLayoutSchema>;

export const ScenarioSchema = z.object({
  scenarioVersion: z.number().int().positive(),
  id: z.string().min(1),
  title: z.string().min(1),
  startNodeId: z.string().min(1),
  // TODO !!! Make nodes a record rather than array
  nodes: z.array(GenericNodeSchema).min(1),
  edges: z.array(NodeEdgeSchema),
  layout: z.record(z.string(), NodeLayoutSchema)  // keyed by nodeId
});
export type Scenario = z.infer<typeof ScenarioSchema>;
