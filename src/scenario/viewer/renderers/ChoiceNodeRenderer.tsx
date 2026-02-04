import type { NodeRendererProps } from "../scenarioTypes";
import type { ChoiceNode } from "../../scenarioNodeSchemas";
import { useState } from "react";
import './Scenario.css';

export function ChoiceNodeRenderer({ node, dispatch }: NodeRendererProps<ChoiceNode>) {
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
              dispatch({ type: "NEXT_NODE", nextId: choice.toNode });
            }}
          >
            {String.fromCharCode(65 + index)}. {choice.label}
          </button>
        ))}
      </div>

      {selectedId && (
        <p style={{ marginTop: "10px" }}>
          {selectedId === "good" ? "✔ Correct" : "✖ Wrong"}
        </p>
      )}
    </section>
  );
}

// TODO Should boxes/whatever also be defined here? It would make sense as far as maintainability goes.