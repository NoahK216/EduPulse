import { tabs, type GenericNode } from "../../nodes";
import type { EditorAction } from "../EditorStore";

export type NodeTabProps<N extends GenericNode = GenericNode> = {
  node: N;
  dispatch: React.ActionDispatch<[action: EditorAction]>;
};

export function TabRenderer(props: NodeTabProps) {
  const { node } = props;
  const Renderer = tabs[node.type] as React.ComponentType<
    NodeTabProps<typeof node>
  >;

  return <Renderer {...props} node={node} />;
}
