import type { ChoiceNode } from "../../nodeSchemas";
import { TextInputDispatch } from "./NodeDispatchFields";
import type { NodeTabProps } from "./TabRenderer";
import {
  panelDangerButtonClassName,
  labelClassName,
  panelInlineInputClassName,
  panelInputClassName,
  panelPrimaryButtonClassName,
  panelTextareaClassName,
  sectionClassName,
  sectionHeaderClassName,
} from "./tabStyles";

export function ChoiceTab({ node, dispatch }: NodeTabProps<ChoiceNode>) {
  const onChoiceLabelChange = (choiceId: string, label: string) => {
    dispatch({
      type: "updateNode",
      id: node.id,
      patch: {
        type: "choice",
        choices: node.choices.map((choice) =>
          choice.id === choiceId ? { ...choice, label } : choice,
        ),
      },
    });
  };

  const addChoice = () => {
    dispatch({
      type: "updateNode",
      id: node.id,
      patch: {
        type: "choice",
        choices: [
          ...node.choices,
          {
            id: crypto.randomUUID(),
            label: `Choice ${node.choices.length + 1}`,
          },
        ],
      },
    });
  };

  const removeChoice = (choiceId: string) => {
    if (node.choices.length <= 1) return;

    dispatch({
      type: "updateNode",
      id: node.id,
      patch: {
        type: "choice",
        choices: node.choices.filter((choice) => choice.id !== choiceId),
      },
    });
  };

  return (
    <>
      <section className={sectionClassName}>
        <p className={sectionHeaderClassName}>Question Setup</p>
        <label className={labelClassName}>Title</label>
        <TextInputDispatch
          node={node}
          path="title"
          dispatch={dispatch}
          className={panelInputClassName}
          placeholder="Question title"
        />
        <label className={`${labelClassName} mt-4`}>Prompt</label>
        <textarea
          className={`${panelTextareaClassName} resize-y`}
          value={node.prompt}
          onChange={(e) =>
            dispatch({
              type: "updateNode",
              id: node.id,
              patch: {
                type: "choice",
                prompt: e.target.value,
              },
            })
          }
          placeholder="What question are learners answering?"
          rows={5}
        />
      </section>

      <section className={sectionClassName}>
        <div className="mb-3 flex items-center justify-between">
          <p className={sectionHeaderClassName}>Choices</p>
          <button
            type="button"
            className={panelPrimaryButtonClassName}
            onClick={addChoice}
          >
            Add Choice
          </button>
        </div>
        <div className="space-y-2.5">
          {node.choices.map((choice, index) => (
            <div
              key={choice.id}
              className="flex items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/35 p-2"
            >
              <span className="w-8 text-center text-xs font-semibold text-slate-400">
                {index + 1}
              </span>
              <input
                type="text"
                className={panelInlineInputClassName}
                value={choice.label}
                onChange={(e) => onChoiceLabelChange(choice.id, e.target.value)}
                placeholder="Choice label"
              />
              <button
                type="button"
                className={panelDangerButtonClassName}
                onClick={() => removeChoice(choice.id)}
                disabled={node.choices.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

