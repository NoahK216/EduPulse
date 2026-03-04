import type { Scenario } from "../scenarioSchemas";

type StarterScenarioOptions = {
  scenarioId?: number | string;
  title?: string;
};

export function buildStarterScenario(
  options: StarterScenarioOptions = {},
): Scenario {
  const startNodeId = crypto.randomUUID();
  const scenarioId = options.scenarioId ?? crypto.randomUUID();
  const normalizedId =
    typeof scenarioId === "number" ? `scenario-${scenarioId}` : scenarioId;

  return {
    scenarioVersion: 1,
    id: normalizedId,
    title: options.title?.trim() || "Untitled Diagram",
    startNodeId,
    nodes: {
      [startNodeId]: {
        id: startNodeId,
        type: "start",
      },
    },
    edges: [],
    layout: {
      [startNodeId]: {
        x: 120,
        y: 120,
      },
    },
  };
}
