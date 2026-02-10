import {z} from 'zod';

import {ScenarioSchema} from '../scenarioSchemas';

export const NodeLayoutSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  locked: z.boolean().optional(),
});
export type NodeLayout = z.infer<typeof NodeLayoutSchema>;

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
