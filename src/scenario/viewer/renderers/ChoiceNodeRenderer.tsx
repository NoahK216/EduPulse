import type { NodeRendererProps } from "../../scenarioTypes";
import type { ChoiceNode } from "../../scenarioNodeSchemas";
import { useState } from "react";
import { nextNodeId } from "../findEdge";

export function ChoiceNodeRenderer({ node, edges, dispatch }: NodeRendererProps<ChoiceNode>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <section>
      <h2>{node.title}</h2>
      <p>{node.prompt}</p>

      <div className="mcq-container">
        {node.choices.map((choice, index) => (
          <button
            key={choice.id}
            className="mcq-option"
            onClick={() => {
              setSelectedId(choice.id);
              dispatch({ type: "NEXT_NODE", nextId: nextNodeId(node, edges, choice.id) });
            }}
          >
            {String.fromCharCode(65 + index)}. {choice.label}
          </button>
        ))}
      </div>
    </section>
  );
}
