import type { ChoiceNode } from "../../nodeSchemas";

export function ChoiceTab(node: ChoiceNode) {
  return (
    <div className="custom-node">
      {node.title}
    </div>
  );
}
