import type { NodeRendererProps } from "../scenarioTypes";
import type { ChoiceNode } from "../nodeTypes";

export function ChoiceNodeRenderer({ node, dispatch }: NodeRendererProps<ChoiceNode>) {
  return (
    <section>
      <h2>{node.title}</h2>
      <p>{node.prompt}</p>

      <div>
        {node.choices.map((c) => (
          <button key={c.id} onClick={() => dispatch({ type: "SELECT_CHOICE", choiceId: c.id })}>
            {c.label}
          </button>
        ))}
      </div>
    </section>
  );
}
