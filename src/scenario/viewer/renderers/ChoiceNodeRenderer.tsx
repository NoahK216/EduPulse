import type { NodeRendererProps } from "../scenarioTypes";
import type { ChoiceNode } from "../scenarioNodeSchemas";

export function ChoiceNodeRenderer({ node, dispatch }: NodeRendererProps<ChoiceNode>) {
  return (
    <section>
      <h2>{node.title}</h2>
      <p>{node.prompt}</p>

      <div>
        {node.choices.map((c) => (
          <button key={c.id} onClick={() => dispatch({ type: "NEXT_NODE", nextId: c.toNode })}>
            {c.label}
          </button>
        ))}
      </div>
    </section>
  );
}
