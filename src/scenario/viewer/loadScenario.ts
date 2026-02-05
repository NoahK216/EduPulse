import {z} from 'zod';
import {ScenarioSchema, type Scenario} from '../scenarioTypes';

export async function loadScenario(url: string): Promise<Scenario> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load scenario: ${res.status}`);
  const data = await res.json();

  const parsed = ScenarioSchema.safeParse(data);
  if (!parsed.success) {
    console.error(z.treeifyError(parsed.error));
    throw new Error("Scenario JSON failed validation.");
  }
  return parsed.data;
}
