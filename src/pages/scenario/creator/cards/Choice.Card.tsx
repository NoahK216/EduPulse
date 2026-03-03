import type { ChoiceNode } from "../../nodeSchemas";
import {
  Handle,
  Position,
  type NodeProps
} from '@xyflow/react';
import type { ReactFlowCard } from "./Cards";
import { NodeCardFrame } from "./NodeCardFrame";

export function ChoiceCard(props: NodeProps<ReactFlowCard<ChoiceNode>>) {
  const node = props.data.node;

  return (
    <NodeCardFrame nodeId={node.id} selected={Boolean(props.selected)}>
      <Handle type="target" position={Position.Left} className="creator-handle" />
      <p className="creator-card-kicker">Multiple Choice</p>
      <h2 className="creator-card-title">{node.title?.trim() || "Untitled choice"}</h2>
      <p className="creator-card-description">
        {node.prompt?.trim() || "Question prompt not set."}
      </p>

      <div className="creator-card-list">
        {node.choices.map((choice, index) => (
          <div key={choice.id} className="creator-card-row">
            <span className="creator-card-badge">
              {String.fromCharCode(65 + (index % 26))}
            </span>
            <div className="creator-card-pill">
              {choice.label?.trim() || `Choice ${index + 1}`}
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id={choice.id}
              className="creator-handle"
            />
          </div>
        ))}
      </div>
    </NodeCardFrame>
  );
}
