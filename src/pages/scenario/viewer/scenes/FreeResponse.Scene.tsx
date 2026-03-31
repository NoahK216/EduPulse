import { useState, type FormEvent } from "react";

import type { FreeResponseNode } from "../../nodeSchemas";
import type { NodeSceneProps } from "../viewerTypes";

export function FreeResponseScene({
  node,
  busy,
  errorMessage,
  dispatch,
}: NodeSceneProps<FreeResponseNode>) {
  const [response, setResponse] = useState<string>("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!response.trim()) return;

    await dispatch({ type: "SUBMIT_FREE_RESPONSE", answerText: response.trim() });
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
            placeholder={node.placeholder || "Enter response..."}
            disabled={busy}
          />
          <input
            className="w-fit cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            value={busy ? "Submitting..." : "Submit"}
            disabled={busy || response.trim().length === 0}
          />

          {errorMessage ? (
            <p className="text-sm text-red-400">{errorMessage}</p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
