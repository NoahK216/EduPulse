import type { FreeResponseNode } from "../../nodeSchemas";
import { TextInputDispatch } from "./NodeDispatchFields";
import type { NodeTabProps } from "./TabRenderer";

export function FreeResponseTab({ node, dispatch }: NodeTabProps<FreeResponseNode>) {
  return (
    <>
      <label>Hello</label>
      <TextInputDispatch
        node={node}
        path="title"
        dispatch={dispatch}
        className="w-full rounded-xl border border-white/20 bg-black/20 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Title"
      />

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
