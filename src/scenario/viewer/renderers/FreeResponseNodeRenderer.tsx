import { useState, type FormEvent } from "react";
import type { NodeRendererProps } from "../scenarioTypes";
import type { FreeResponseNode } from "../../scenarioNodeSchemas";
import { evaluateFreeResponse, type FreeResponseEvaluation } from "./FreeResponseGrader";

export function FreeResponseNodeRenderer({ node, dispatch }: NodeRendererProps<FreeResponseNode>) {
  const [response, setResponse] = useState<string>("");
  const [evaluation, setEvaluation] = useState<FreeResponseEvaluation | null>(null);
  const [nodeState, setNodeState] = useState<'error' | 'responding' | 'evaluating' | 'feedback'>('responding');
  const [evalError, setEvalError] = useState("");

  const evaluatedChoice = (evaluation: FreeResponseEvaluation) => {
    return node.rubric.answerBuckets.find((bucket) => bucket.id === evaluation?.bucket_id)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setNodeState('evaluating');
    setEvaluation(null);

    const result = await evaluateFreeResponse(node, response);

    if (result.ok) {
      setEvaluation(result.evaluation);
      console.log(evaluatedChoice(result.evaluation));

      if (result.evaluation.feedback) {
        setNodeState('feedback')
      } else {
        dispatch({ type: "NEXT_NODE", nextId: evaluatedChoice(result.evaluation)?.toNode })
      }
    } else {
      setNodeState('error');
      setEvalError(result.error);
    }
  };

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
        {nodeState !== 'responding' &&
          <div className="fr-right">
            <h3>Feedback</h3>
            {(() => {
              switch (nodeState) {
                case 'error':
                  return <p style={{ color: "red" }}>{evalError}</p>;
                case 'evaluating':
                  return <p>Evaluating Response...</p>;
                case 'feedback':
                  return (
                    <>
                      <pre style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                        {evaluation?.feedback}
                      </pre>
                      <button
                        onClick={() => { dispatch({ type: "NEXT_NODE", nextId: evaluatedChoice(evaluation!)?.toNode }) }}
                      >Continue</button>
                    </>
                  )
              }
            })()}
          </div>
        }
      </div>
    </section>
  );
}
