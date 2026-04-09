import { scenes } from "../../nodes";
import type { NodeSceneProps } from "../viewerTypes";

export function SceneRenderer(props: NodeSceneProps) {
  const { node } = props;
  const Renderer = scenes[node.type] as React.ComponentType<
    NodeSceneProps<typeof node>
  >;

  return <Renderer {...props} node={node} />;
}
