import type { NodeRendererProps } from "../scenarioTypes";
import type { FreeResponseNode } from "../scenarioNodeSchemas";
import { useState, type ChangeEvent, type FormEvent } from "react";

export function FreeResponseNodeRenderer({ node, dispatch }: NodeRendererProps<FreeResponseNode>) {
  const [response, setResponse] = useState<string>("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    dispatch({ type: "SUBMIT_FREE_RESPONSE", text: response });
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
