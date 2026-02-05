import type { GenericNode } from "../nodes";
import type { NodeEdge } from "../scenarioSchemas";

// TODO ScenarioVars are on the chopping block, remove unless a reason for their existence becomes apparent
export type ScenarioVars = Record<string, unknown>;

export type ScenarioEvent =
  | { type: 'NEXT_NODE'; nextId?: string; }

export type NodeSceneProps<N extends GenericNode = GenericNode> = {
  node: N;
  edges: NodeEdge[];
  vars: ScenarioVars;
  dispatch: (event: ScenarioEvent) => void;
};

export function nextNodeId(
    node: GenericNode, edges: NodeEdge[], port?: string) {
  const edge = edges.find((edge) => {
    const nodeMatch = edge.from.nodeId === node.id;
    if (nodeMatch && port) {
      return nodeMatch && (edge.from.port === port)
    }
    return nodeMatch;
  });

  console.log(edge)

  return edge?.to?.nodeId
}
