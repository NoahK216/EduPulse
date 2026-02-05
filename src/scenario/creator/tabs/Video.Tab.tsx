import type { VideoNode } from "../../nodeSchemas";

export function VideoTab(node: VideoNode) {
  return (
    <div className="custom-node">
      {node.title}
    </div>
  );
}
