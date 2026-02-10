import type { Node, Edge } from "@xyflow/react";
import type { GenericNode } from "../nodes";
import { type NodeLayout, type EditorScenario, EditorScenarioSchema } from "./EditorScenarioSchemas";

export function flowNodeFromGenericNode(
    node: GenericNode, layout?: NodeLayout): Node {
  const position = {
    x: layout?.x ?? 0,
    y: layout?.y ?? 0,
  };
  const baseNode: Node = {
    id: node.id,
    position,
    data: {
      label: node.title ?? node.id,
      initialNode: node,
    },
    width: layout?.width,
    height: layout?.height,
    draggable: layout?.locked ? false : undefined,
  };

  return {
    ...baseNode,
    type: node.type,
  };
}

export function flowGraphFromEditorScenario(editorScenario: EditorScenario):
    {nodes: Node[], edges: Edge[]} {
  const nodes: Node[] = editorScenario.scenario.nodes.map((node) => {
    return flowNodeFromGenericNode(node, editorScenario.layout[node.id]);
  });

  const edges: Edge[] =
      editorScenario.scenario.edges.filter((edge) => edge.to?.nodeId)
          .map((edge) => ({
                 id: edge.id,
                 source: edge.from.nodeId,
                 sourceHandle: edge.from.port,
                 target: edge.to!.nodeId,
                 ...(edge.from.port ? {label: edge.from.port} : {}),
               }));

  return {nodes, edges};
}

export async function importScenarioFromFile(file: File) {
  const text = await file.text();

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file (could not parse).");
  }

  // throws ZodError if invalid
  return EditorScenarioSchema.parse(raw);
}
