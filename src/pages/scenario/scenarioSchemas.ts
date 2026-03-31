import {z} from 'zod';

import { GenericNodeSchema, type GenericNode } from "./nodeSchemas.js";

export const NodeEdgeSchema = z.object({
  id: z.string(), 
  from: z.object({
    nodeId: z.string(),
    port: z.string().optional()
  }),
  to: z.object({
    nodeId: z.string()
  }).optional() 
  //? Is there a reason for 'to' to be optional
});
export type NodeEdge = z.infer<typeof NodeEdgeSchema>;

// TODO Remove width and height
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
  nodes: z.record(z.string(), GenericNodeSchema),  // keyed by nodeId
  edges: z.array(NodeEdgeSchema),
  layout: z.record(z.string(), NodeLayoutSchema)  // keyed by nodeId
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export function getScenarioNode(
  scenario: Scenario,
  nodeId: string | null | undefined,
): GenericNode | null {
  if (!nodeId) {
    return null;
  }

  return scenario.nodes[nodeId] ?? null;
}

export function getNextNodeIdForScenarioNode(
  node: GenericNode,
  edges: NodeEdge[],
  port?: string,
) {
  const edge = edges.find((candidate) => {
    if (candidate.from.nodeId !== node.id) {
      return false;
    }

    if (typeof port === "string") {
      return candidate.from.port === port;
    }

    return true;
  });

  return edge?.to?.nodeId;
}
