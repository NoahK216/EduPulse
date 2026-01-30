import type { NodeRendererProps } from "../scenarioTypes";
import type { FreeResponseNode } from "../scenarioNodeSchemas";
import { useState, type ChangeEvent, type FormEvent } from "react";
import "./Scenario.css";


export function FreeResponseNodeRenderer({ node, dispatch }: NodeRendererProps<FreeResponseNode>) {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // TODO this will eventually be calling LLM evaluation and passing the corresponding next node
    setLoading(true);

    dispatch({ type: "NEXT_NODE", text: response });

    setTimeout(() => setLoading(false), 2500);
  }

  if (loading) {
    return (
      <section>
        <h2>{node.title}</h2>
        <p>Evaluating response..</p>
      </section>
    );
  }

  return (
    <section>
      <h2>{node.title}</h2>
      <p>{node.prompt}</p>

      <div className="fr-layout">
        <form onSubmit={handleSubmit} className="fr-left">
          <textarea
            className="fr-textarea"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={8}
            placeholder="Enter response..."
          />
          <input className="fr-submit" type="submit" value="Submit" />
        </form>
        <div className="fr-right">
          <h3>Feedback</h3>
          <p><b>Evaluation:</b></p>
          <ul>
            <li>Placeholder</li>
          </ul>
          <p><b>Placeholder</b></p>
          <p>LLM response: </p>
        </div>
      </div>
    </section>
  );
}
