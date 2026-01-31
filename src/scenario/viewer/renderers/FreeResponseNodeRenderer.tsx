import type { NodeRendererProps } from "../scenarioTypes";
import type { FreeResponseNode } from "../scenarioNodeSchemas";
import { useState, type FormEvent } from "react";
import "./Scenario.css";


export function FreeResponseNodeRenderer({ node, dispatch, state }: NodeRendererProps<FreeResponseNode>) {
  const [response, setResponse] = useState<string>("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    dispatch({ type: "SUBMIT_FREE_RESPONSE", text: response });
  }

  return (
    <section>
      <h2>{node.title}</h2>
      <p><strong>Question:</strong> {node.prompt}</p>

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
          {(() => {
            const grading = Boolean(state.vars.grading);
            const grade = state.vars.grade as string | null;
            const gradeError = state.vars.gradeError as string | null;

            if (grading) return <p>Grading...</p>;
            if (gradeError) return <p style={{ color: "red" }}>{gradeError}</p>;
            if (grade)
              return (
                <pre style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                  {grade}
                </pre>
              );
            return <p>LLM response will appear here after submission.</p>;
          })()}
        </div>
      </div>
    </section>
  );
}
