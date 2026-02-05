import {z} from 'zod';

import {ScenarioSchema} from '../scenarioTypes';

import type {Edge, Node} from '@xyflow/react';

export const NodeLayoutSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  locked: z.boolean().optional(),
});

// TODO Figure out what to do with JSON differences
export const EditorScenarioSchema = z.object({
  meta: z.object({editorVersion: z.number().int()}),
  scenario: ScenarioSchema,
  layout: z.record(z.string(), NodeLayoutSchema)  // keyed by nodeId
});
export type EditorScenario = z.infer<typeof EditorScenarioSchema>;

// TODO Templating out loadScenario to verify for any schema probably makes more
// sense
export async function loadEditorScenario(url: string): Promise<EditorScenario> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load scenario: ${res.status}`);
  const data = await res.json();

  const parsed = EditorScenarioSchema.safeParse(data);
  if (!parsed.success) {
    console.error(z.treeifyError(parsed.error));
    throw new Error('Scenario JSON failed validation.');
  }
  return parsed.data;
}

export function flowGraphFromEditorScenario(editorScenario: EditorScenario):
    {nodes: Node[], edges: Edge[]} {
  const nodes: Node[] = editorScenario.scenario.nodes.map((node) => {
    const layout = editorScenario.layout[node.id];
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

    // TODO This should be inferred with some registry like ScenarioNodeSchema
    switch (node.type) {
      case 'video':
        return {
          ...baseNode,
          type: 'video',
          data: {initialNode: node},
        };
      default:
        return baseNode;
    }
  });

  const edges: Edge[] =
      editorScenario.scenario.edges.filter((edge) => edge.to?.nodeId)
          .map((edge) => ({
                 id: edge.id,
                 source: edge.from.nodeId,
                 target: edge.to!.nodeId,
                 ...(edge.from.port ? {label: edge.from.port} : {}),
               }));

  return {nodes, edges};
}
