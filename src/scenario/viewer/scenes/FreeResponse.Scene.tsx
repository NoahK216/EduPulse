import { useState, type FormEvent } from "react";
import { nextNodeId, type NodeSceneProps } from "../viewer";
import type { FreeResponseNode } from "../../nodeSchemas";
import { evaluateFreeResponse, type FreeResponseEvaluation } from "./FreeResponseGrader";

export function FreeResponseScene({ node, edges, dispatch }: NodeSceneProps<FreeResponseNode>) {
  const [response, setResponse] = useState<string>("");
  const [evaluation, setEvaluation] = useState<FreeResponseEvaluation | null>(null);
  const [nodeState, setNodeState] = useState<'error' | 'responding' | 'evaluating' | 'feedback'>('responding');
  const [evalError, setEvalError] = useState("");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);


  const evaluatedChoice = (evaluation: FreeResponseEvaluation) => {
    return node.rubric.answerBuckets.find((bucket) => bucket.id === evaluation?.bucket_id)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!response.trim()) return;
    setNodeState('evaluating');
    setEvaluation(null);
    setIsFeedbackOpen(false);
    const result = await evaluateFreeResponse(node, response);

    if (result.ok) {
      setEvaluation(result.evaluation);
      console.log(evaluatedChoice(result.evaluation));

      if (result.evaluation.feedback) {
        setNodeState('feedback')
        setIsFeedbackOpen(true);
      } else {
        dispatch({ type: "NEXT_NODE", nextId: nextNodeId(node, edges, result.evaluation.bucket_id) })
      }
    } else {
      setNodeState('error');
      setEvalError(result.error);
    }
  };

return (
  <section className="w-full max-w-4xl">
    <h2 className="text-3xl font-bold">{node.title}</h2>
    <p className="mt-2 text-sm text-white/75">
      <span className="font-semibold text-white">Question:</span> {node.prompt}
    </p>
    <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-start">
      <form onSubmit={handleSubmit} className="flex-1 space-y-2">
        <textarea
          className="w-full resize-none rounded-xl border border-white/20 bg-black/20 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={8}
          placeholder="Enter response..."
          disabled={nodeState !== "responding"}
        />
        {nodeState === "responding" && (
        <input
          className="w-fit cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
          type="submit"
          value="Submit"
        />)}
        {nodeState === "feedback" && !isFeedbackOpen && (
          <button
            type="button"
            className="w-fit rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
            onClick={() => setIsFeedbackOpen(true)}>Review feedback</button>
        )}
        {nodeState === "evaluating" && (
          <p className="text-sm text-white/70">Evaluating response...</p>
        )}

        {nodeState === "error" && (
          <p className="text-sm text-red-400">{evalError}</p>
        )}
      </form>
    </div>
    {isFeedbackOpen && nodeState === "feedback" && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-2xl rounded-xl border border-white/20 bg-zinc-900 p-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-base font-semibold">Feedback</h3>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setIsFeedbackOpen(false)}
                aria-label="Close feedback">X</button>
          </div>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-white/80">
              {evaluation?.feedback}
          </pre>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
              onClick={() => setIsFeedbackOpen(false)}>Close</button>
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              onClick={() => {
                setIsFeedbackOpen(false);
                dispatch({
                  type: "NEXT_NODE",
                  nextId: nextNodeId(node, edges, evaluation!.bucket_id),
                });
              }}>Continue</button>
          </div>
        </div>
      </div>
    )}
  </section>
);

}
