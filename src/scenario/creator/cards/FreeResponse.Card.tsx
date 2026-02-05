import type { FreeResponseNode } from "../../nodeSchemas";
import { useState } from "react";
import {
  Handle,
  Position,
  type Node,
  type NodeProps
} from '@xyflow/react';

export type FreeResponseNodeFlow = Node<
  {
    initialNode: FreeResponseNode
  }
  >;

export function FreeResponseCard(props: NodeProps<FreeResponseNodeFlow>) {
  const [nodeData, setNodeData] = useState<FreeResponseNode>(props.data.initialNode);


  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Left} />
      <h2>{nodeData.title}</h2>
      <p><strong>Question:</strong> {nodeData.prompt}</p>

      <div className="mcq-container">
        {nodeData.rubric.answerBuckets.map((bucket) => (
          <div key={bucket.id} className="creator-node-row">
            <div className="creator-bucket">{bucket.classifier}</div>
            <Handle type="source" position={Position.Right} id={bucket.id} />
          </div>
        ))}
      </div>
    </div >
  );
}
