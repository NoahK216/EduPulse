import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { StartNode } from "../../nodeSchemas";
import type { ReactFlowCard } from "./Cards";
import { NodeCardFrame } from "./NodeCardFrame";

export function StartCard(props: NodeProps<ReactFlowCard<StartNode>>) {
  const node = props.data.node;

  return (
    <NodeCardFrame
      nodeId={node.id}
      selected={Boolean(props.selected)}
      inspectable={false}
    >
      <p className="creator-card-kicker">Start</p>
      <p className="creator-card-description">
        Connect to the first scenario node.
      </p>
      <Handle
        type="source"
        position={Position.Right}
        id=""
        className="creator-handle"
      />
    </NodeCardFrame>
  );
}
