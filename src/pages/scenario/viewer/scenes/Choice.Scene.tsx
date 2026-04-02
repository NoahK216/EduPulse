import type { ChoiceNode } from "../../nodeSchemas";
import type { NodeSceneProps } from "../viewerTypes";
import { cn } from "../../../../lib/cn";
import { SceneLayout } from "./sceneUi";

export function ChoiceScene({
  node,
  busy,
  errorMessage,
  dispatch,
}: NodeSceneProps<ChoiceNode>) {
  const prompt = node.prompt?.trim();

  return (
    <SceneLayout
      tone="amber"
      label="Decision"
      title={node.title?.trim() || "Choose a response"}
      errorMessage={errorMessage}
    >
      <div className="grid gap-4">
        {prompt ? (
          <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">
            {prompt}
          </p>
        ) : null}

        {node.choices.map((choice, index) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => {
              void dispatch({ type: "SELECT_CHOICE", choiceId: choice.id });
            }}
            disabled={busy}
            className={cn(
              "group flex w-full items-start gap-4 rounded-[1.25rem] border border-neutral-200 bg-white px-4 py-4 text-left transition hover:border-amber-300 hover:bg-amber-50/70 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10",
            )}
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-neutral-50 text-sm font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="pt-1 text-sm leading-6 text-neutral-800 dark:text-neutral-100">
              {choice.label}
            </span>
          </button>
        ))}
      </div>
    </SceneLayout>
  );
}
