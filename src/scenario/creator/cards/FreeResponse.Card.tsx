import type { FreeResponseNode } from "../../nodeSchemas";
import {
  Handle,
  Position,
  type NodeProps
} from '@xyflow/react';
import type { ReactFlowCard } from "./Cards";
import { NodeCardFrame } from "./NodeCardFrame";

export function FreeResponseCard(props: NodeProps<ReactFlowCard<FreeResponseNode>>) {
  const node = props.data.node;

  return (
    <NodeCardFrame nodeId={node.id} selected={Boolean(props.selected)}>
      <Handle type="target" position={Position.Left} className="creator-handle" />
      <p className="creator-card-kicker">Free Response</p>
      <h2 className="creator-card-title">{node.title?.trim() || "Untitled prompt"}</h2>
      <p className="creator-card-description">
        {node.prompt?.trim() || "Prompt text not set."}
      </p>
      {node.rubric.context.trim() && (
        <p className="creator-card-subtle">{node.rubric.context}</p>
      )}

      <div className="creator-card-list">
        {node.rubric.answerBuckets.map((bucket, index) => (
          <div key={bucket.id} className="creator-card-row">
            <span className="creator-card-badge">{index + 1}</span>
            <div className="creator-card-pill">
              {bucket.classifier?.trim() || `Bucket ${index + 1}`}
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id={bucket.id}
              className="creator-handle"
            />
          </div>
        ))}
      </div>
    </NodeCardFrame>
  );
}
