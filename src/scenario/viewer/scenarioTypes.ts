import type { ScenarioNode } from "./nodeTypes";

export type ScenarioState = {
  currentNodeId: string;
  vars: Record<string, unknown>;
};

export type ScenarioEvent =
  | { type: "VIDEO_ENDED" }
  | { type: "SUBMIT_FREE_RESPONSE"; text: string }
  | { type: "SELECT_CHOICE"; choiceId: string };

export type NodeRendererProps<N extends ScenarioNode = ScenarioNode> = {
  node: N;
  state: ScenarioState;
  dispatch: (event: ScenarioEvent) => void;
};
