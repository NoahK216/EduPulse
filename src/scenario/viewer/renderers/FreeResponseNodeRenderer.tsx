import type { NodeRendererProps } from "../scenarioTypes";
import type { FreeResponseNode } from "../scenarioNodeSchemas";
import { useState, type ChangeEvent, type FormEvent } from "react";

export function FreeResponseNodeRenderer({ node, dispatch }: NodeRendererProps<FreeResponseNode>) {
  const [response, setResponse] = useState<string>("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // TODO this will eventually be calling LLM evaluation and passing the corresponding next node

    dispatch({ type: "NEXT_NODE" });
  }

  const handleResponseUpdate = (event: ChangeEvent<HTMLInputElement>) => {
    setResponse(event.target.value);
  }

  return (
    <section>
      <h2>{node.title}</h2>
      <p>{node.prompt}</p>

      <form onSubmit={handleSubmit}>
        <input type="textarea" value={response} onChange={handleResponseUpdate} />
        <input type="submit" value="Submit" />
      </form>

    </section>
  );
}
