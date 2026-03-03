import type { ChoiceNode } from "../../nodeSchemas";
import { nextNodeId, type NodeSceneProps } from "../viewer";

export function ChoiceScene({ node, edges, dispatch }: NodeSceneProps<ChoiceNode>) {
  return (
    <section>
      <h2>{node.title}</h2>
      <p>{node.prompt}</p>

      <div className="flex flex-col gap-2 mt-4">
        {node.choices.map((choice, index) => (
          <button
            key={choice.id}
            onClick={() => {
              dispatch({ type: "NEXT_NODE", nextId: nextNodeId(node, edges, choice.id) });
            }}>
            {String.fromCharCode(65 + index)}. {choice.label}
          </button>
        ))}
      </div>
    </section>
  );
}
