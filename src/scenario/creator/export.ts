import type {Edge, Node} from '@xyflow/react';
import type {GenericNode} from '../nodes';
import {EditorScenarioSchema, type EditorScenario, type NodeLayout} from './EditorScenarioSchemas';

export const exportScenarioToJSON =
    (doc: unknown) => {
      const parsed = EditorScenarioSchema.parse(doc);  // throws if invalid
      return parsed;
    }

function toNodeLayout(node: Node): NodeLayout {
  return {
    x: node.position.x,
    y: node.position.y,
    ...(typeof node.width === 'number' ? {width: node.width} : {}),
    ...(typeof node.height === 'number' ? {height: node.height} : {}),
    ...(node.draggable === false ? {locked: true} : {}),
  };
}

function toScenarioNode(node: Node): GenericNode {
  const initialNode = (node.data as {initialNode?: GenericNode})?.initialNode;
  if (!initialNode) {
    throw new Error(`Node "${node.id}" is missing data.initialNode.`);
  }

  return {
    ...initialNode,
    id: node.id,
  };
}

export const reactFlowToScenario =
    (nodes: Node[], edges: Edge[], oldScenario: EditorScenario): EditorScenario => {
      const nextScenario: EditorScenario = {
        ...oldScenario,
        scenario: {
          ...oldScenario.scenario,
          nodes: nodes.map(toScenarioNode),
          edges: edges.map((edge) => ({
            id: edge.id,
            from: {
              nodeId: edge.source,
              ...(edge.sourceHandle ? {port: edge.sourceHandle} : {}),
            },
            to: {nodeId: edge.target},
          })),
        },
        layout: Object.fromEntries(nodes.map((node) => [node.id, toNodeLayout(node)])),
      };

      return EditorScenarioSchema.parse(nextScenario);
    };
