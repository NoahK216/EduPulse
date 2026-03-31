import type { ChoiceNode } from "../../nodeSchemas";
import type { NodeSceneProps } from "../viewerTypes";

export function ChoiceScene({ node, busy, errorMessage, dispatch }: NodeSceneProps<ChoiceNode>) {
  return (
    <section>
      <h2>{node.title}</h2>
      <p>{node.prompt}</p>

      <div className="flex flex-col gap-2 mt-4">
        {node.choices.map((choice, index) => (
          <button
            key={choice.id}
            onClick={() => {
              dispatch({ type: "SELECT_CHOICE", choiceId: choice.id });
            }}
            disabled={busy}>
            {String.fromCharCode(65 + index)}. {choice.label}
          </button>
        ))}
      </div>

      {errorMessage ? <p>{errorMessage}</p> : null}
    </section>
  );
}
