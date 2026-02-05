import type { ChoiceNode } from "../../nodeSchemas";
import { useState } from "react";
import {
  Handle,
  Position,
  type Node,
  type NodeProps
} from '@xyflow/react';

export type ChoiceNodeFlow = Node<
  {
    initialNode: ChoiceNode
  }
>;

export function ChoiceCard(props: NodeProps<ChoiceNodeFlow>) {
  const [nodeData, setNodeData] = useState<ChoiceNode>(props.data.initialNode);

  return (
    <div className="custom-node">
      <h2>{nodeData.title}</h2>
      <p>{nodeData.prompt}</p>
      <Handle type="target" position={Position.Left} />

      <div className="mcq-container">
        {nodeData.choices.map((choice, index) => (
          <div key={choice.id} className="creator-node-row">
            <button
              className="mcq-option"
              onClick={() => {
                // setSelectedId(choice.id);
                // dispatch({ type: "NEXT_NODE", nextId: nextNodeFromChoice(choice.id) });
              }}
            >
              {String.fromCharCode(65 + index)}. {choice.label}
            </button>
            <Handle type="source" position={Position.Right} id={choice.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
