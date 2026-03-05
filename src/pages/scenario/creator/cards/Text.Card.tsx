import type { TextNode } from "../../nodeSchemas";
import {
  Handle,
  Position,
  type NodeProps
} from '@xyflow/react';
import type { ReactFlowCard } from "./Cards";
import { NodeCardFrame } from "./NodeCardFrame";

export function TextCard(props: NodeProps<ReactFlowCard<TextNode>>) {
  const node = props.data.node;

  return (
    <NodeCardFrame nodeId={node.id} nodeType={node.type} selected={Boolean(props.selected)}>
      <Handle type="target" position={Position.Left} className="creator-handle" />
      <h2 className="creator-card-title">{node.title?.trim() || ""}</h2>
      <p className="creator-card-description">
        {node.text?.trim() || "No text"}
      </p>
      <Handle
        type="source"
        position={Position.Right}
        id={""}
        className="creator-handle"
      />
    </NodeCardFrame>
  );
}
