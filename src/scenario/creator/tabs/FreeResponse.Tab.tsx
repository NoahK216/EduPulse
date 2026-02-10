import type { FreeResponseNode } from "../../nodeSchemas";
import type { NodeTabProps } from "./TabRenderer";

export function FreeResponseTab({ node, dispatch }: NodeTabProps<FreeResponseNode>) {
  return (
    <>
      <p>{node.title}</p>
      <textarea
        className="w-full resize-none rounded-xl border border-white/20 bg-black/20 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        value={node.prompt}
        onChange={(e) => dispatch({
          type: "updateNode", id: node.id, patch: {
            type: "free_response",
            prompt: e.target.value
          }
        })}
        rows={8}
      />
    </>
  );
}
