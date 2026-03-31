import type { TextNode } from "../../nodeSchemas";
import type { NodeSceneProps } from "../viewer";

export function TextScene({ node, busy, errorMessage, dispatch }: NodeSceneProps<TextNode>) {
  return (
    <section>
      <h2>{node.title}</h2>
      <p>{node.text}</p>

      <button
        key={"next"}
        onClick={() => {
          void dispatch({ type: "ADVANCE" });
        }}
        disabled={busy}>
        Continue
      </button>

      {errorMessage ? <p>{errorMessage}</p> : null}
    </section>
  );
}
