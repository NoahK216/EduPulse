import { useState, type FormEvent } from "react";

import type { FreeResponseNode } from "../../nodeSchemas";
import type { NodeSceneProps } from "../viewerTypes";
import {
  SceneLayout,
  scenePrimaryButtonClassName,
} from "./sceneUi";

export function FreeResponseScene({
  node,
  busy,
  errorMessage,
  dispatch,
}: NodeSceneProps<FreeResponseNode>) {
  const [response, setResponse] = useState<string>("");
  const prompt = node.prompt?.trim();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!response.trim()) {
      return;
    }

    await dispatch({ type: "SUBMIT_FREE_RESPONSE", answerText: response.trim() });
  };

  return (
    <SceneLayout
      tone="emerald"
      label="Written Response"
      title={node.title?.trim() || "Reflect and respond"}
      errorMessage={errorMessage}
    >
      <div className="space-y-4">
        {prompt ? (
          <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">
            {prompt}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="min-h-56 w-full resize-y rounded-[1.5rem] border border-neutral-200 bg-neutral-50/80 p-4 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-emerald-300 focus:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-emerald-500/40 dark:focus:bg-neutral-900/70"
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            placeholder={node.placeholder || "Write your response here..."}
            disabled={busy}
          />

          <button
            className={scenePrimaryButtonClassName}
            type="submit"
            disabled={busy || response.trim().length === 0}
          >
            {busy ? "Submitting..." : "Submit Response"}
          </button>
        </form>
      </div>
    </SceneLayout>
  );
}
