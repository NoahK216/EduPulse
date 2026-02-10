import type { Node, Edge } from "@xyflow/react";
import type { GenericNode } from "../nodes";
import {type NodeLayout, type Scenario, ScenarioSchema} from '../scenarioSchemas';
import z from "zod";

// TODO Templating out loadScenario to verify for any schema probably makes more
// sense
export async function loadScenario(url: string): Promise<Scenario> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load scenario: ${res.status}`);
  const data = await res.json();

  const parsed = ScenarioSchema.safeParse(data);
  if (!parsed.success) {
    console.error(z.treeifyError(parsed.error));
    throw new Error('Scenario JSON failed validation.');
  }
  return parsed.data;
}


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

export function flowGraphFromScenario(scenario: Scenario):
    {nodes: Node[], edges: Edge[]} {
  const nodes: Node[] = scenario.nodes.map((node) => {
    return flowNodeFromGenericNode(node, scenario.layout[node.id]);
  });

  const edges: Edge[] =
      scenario.edges.filter((edge) => edge.to?.nodeId)
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
  return ScenarioSchema.parse(raw);
}
