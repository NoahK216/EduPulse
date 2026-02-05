import type { ChoiceNode } from "../../nodeSchemas";
import { nextNodeId, type NodeSceneProps } from "../viewer";

export function ChoiceScene({ node, edges, dispatch }: NodeSceneProps<ChoiceNode>) {
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
