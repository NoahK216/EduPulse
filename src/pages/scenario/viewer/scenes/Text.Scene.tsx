import type { TextNode } from "../../nodeSchemas";
import type { NodeSceneProps } from "../viewerTypes";
import {
  SceneLayout,
  scenePrimaryButtonClassName,
} from "./sceneUi";

export function TextScene({
  node,
  busy,
  errorMessage,
  dispatch,
}: NodeSceneProps<TextNode>) {
  const title = node.title?.trim() || "Scenario Step";
  const body = node.text?.trim() || "Continue to move to the next part of the scenario.";

  return (
    <SceneLayout
      tone="cyan"
      label="Reading"
      title={title}
      errorMessage={errorMessage}
      footer={
        <button
          type="button"
          onClick={() => {
            void dispatch({ type: "ADVANCE" });
          }}
          disabled={busy}
          className={scenePrimaryButtonClassName}
        >
          {busy ? "Continuing..." : "Continue"}
        </button>
      }
    >
      <div className="rounded-[1.25rem] border border-neutral-200 bg-neutral-50/80 p-5 dark:border-neutral-800 dark:bg-neutral-900/70">
        <p className="whitespace-pre-wrap text-base leading-8 text-neutral-700 dark:text-neutral-200">
          {body}
        </p>
      </div>
    </SceneLayout>
  );
}
