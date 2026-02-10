import type { FreeResponseNode } from "../../nodeSchemas";
import {
  Handle,
  Position,
  type NodeProps
} from '@xyflow/react';
import type { ReactFlowCard } from "./Cards";

export function FreeResponseCard(props: NodeProps<ReactFlowCard<FreeResponseNode>>) {
  const node = props.data.node;

  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Left} />
      <h2>{node.title}</h2>
      <p><strong>Question:</strong> {node.prompt}</p>

      <div className="mcq-container">
        {node.rubric.answerBuckets.map((bucket) => (
          <div key={bucket.id} className="creator-node-row">
            <div className="creator-bucket">{bucket.classifier}</div>
            <Handle type="source" position={Position.Right} id={bucket.id} />
          </div>
        ))}
      </div>
    </div >
  );
}
