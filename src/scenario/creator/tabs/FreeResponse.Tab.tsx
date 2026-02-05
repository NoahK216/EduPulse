import type { FreeResponseNode } from "../../nodeSchemas";

export function FreeResponseTab(node: FreeResponseNode) {
  return (
    <div className="custom-node">
      {node.title}
    </div>
  );
}
