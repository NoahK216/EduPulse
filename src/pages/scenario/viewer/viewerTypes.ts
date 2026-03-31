import type { GenericNode } from "../nodeSchemas";
import type { NodeEdge } from "../scenarioSchemas";

export type ScenarioEvent =
  | { type: 'ADVANCE' }
  | { type: 'SELECT_CHOICE'; choiceId: string }
  | { type: 'SUBMIT_FREE_RESPONSE'; answerText: string };

export type NodeSceneProps<N extends GenericNode = GenericNode> = {
  node: N;
  edges: NodeEdge[];
  busy: boolean;
  errorMessage: string | null;
  dispatch: (event: ScenarioEvent) => Promise<void>;
};
