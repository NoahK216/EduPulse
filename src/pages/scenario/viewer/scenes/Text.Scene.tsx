import type { TextNode } from "../../nodeSchemas";
import { nextNodeId, type NodeSceneProps } from "../viewer";

export function TextScene({ node, edges, dispatch }: NodeSceneProps<TextNode>) {
  return (
    <section>
      <h2>{node.title}</h2>
      <p>{node.text}</p>

      <button
        key={"next"}
        onClick={() => {
          dispatch({ type: "NEXT_NODE", nextId: nextNodeId(node, edges) });
        }}>
        Continue
      </button>

    </section>
  );
}
