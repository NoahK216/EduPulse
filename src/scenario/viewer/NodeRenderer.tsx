import type { ComponentType } from "react";
import type { NodeType, ScenarioNode } from "../scenarioNodeSchemas";
import type { NodeRendererProps } from "./scenarioTypes";

// Add new node renderers here
import { VideoNodeRenderer } from "./renderers/VideoNodeRenderer";
import { FreeResponseNodeRenderer } from "./renderers/FreeResponseNodeRenderer";
import { ChoiceNodeRenderer } from "./renderers/ChoiceNodeRenderer";

type RendererMap = {
  [K in NodeType]: ComponentType<NodeRendererProps<Extract<ScenarioNode, { type: K }>>>;
};

// ! UPDATE THIS WITH EVERY NEW NODE TYPE
export const nodeRendererRegistry = {
  video: VideoNodeRenderer,
  free_response: FreeResponseNodeRenderer,
  choice: ChoiceNodeRenderer,
} satisfies RendererMap;

export function NodeRenderer(props: NodeRendererProps) {
  const { node } = props;
  const Renderer = nodeRendererRegistry[node.type] as React.ComponentType<
    NodeRendererProps<typeof node>
  >;

  return <Renderer {...props} node={node} />;
}
