import type {ScenarioNode} from '../scenarioNodeSchemas';
import type {NodeEdge} from '../scenarioTypes';

export function nextNodeId(
    node: ScenarioNode, edges: NodeEdge[], port?: string) {
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