import type { ChoiceNode } from "../../nodeSchemas";
import {
  Handle,
  Position,
  type NodeProps
} from '@xyflow/react';
import type { ReactFlowCard } from "./Cards";

export function ChoiceCard(props: NodeProps<ReactFlowCard<ChoiceNode>>) {
  const node = props.data.node;

  return (
    <div className="custom-node">
      <h2>{node.title}</h2>
      <p>{node.prompt}</p>
      <Handle type="target" position={Position.Left} />

      <div className="mcq-container">
        {node.choices.map((choice, index) => (
          <div key={choice.id} className="creator-node-row">
            <button
              className="mcq-option"
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
