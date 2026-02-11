import type { FreeResponseNode } from "../../nodeSchemas";
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

export function FreeResponseTab({ node, dispatch }: NodeTabProps<FreeResponseNode>) {
  const updateRubric = (rubric: FreeResponseNode["rubric"]) => {
    dispatch({
      type: "updateNode",
      id: node.id,
      patch: {
        type: "free_response",
        rubric,
      },
    });
  };

  const onBucketClassifierChange = (bucketId: string, classifier: string) => {
    updateRubric({
      ...node.rubric,
      answerBuckets: node.rubric.answerBuckets.map((bucket) =>
        bucket.id === bucketId ? { ...bucket, classifier } : bucket,
      ),
    });
  };

  const addBucket = () => {
    updateRubric({
      ...node.rubric,
      answerBuckets: [
        ...node.rubric.answerBuckets,
        {
          id: crypto.randomUUID(),
          classifier: `classifier ${node.rubric.answerBuckets.length + 1}`,
        },
      ],
    });
  };

  const removeBucket = (bucketId: string) => {
    if (node.rubric.answerBuckets.length <= 1) return;

    updateRubric({
      ...node.rubric,
      answerBuckets: node.rubric.answerBuckets.filter(
        (bucket) => bucket.id !== bucketId,
      ),
    });
  };

  return (
    <>
      <section className={sectionClassName}>
        <p className={sectionHeaderClassName}>Prompt Setup</p>
        <label className={labelClassName}>Title</label>
        <TextInputDispatch
          node={node}
          path="title"
          dispatch={dispatch}
          className={panelInputClassName}
          placeholder="Prompt title"
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
                type: "free_response",
                prompt: e.target.value,
              },
            })
          }
          placeholder="Ask learners to explain their answer..."
          rows={7}
        />
        <label className={`${labelClassName} mt-4`}>Placeholder Text</label>
        <TextInputDispatch
          node={node}
          path="placeholder"
          dispatch={dispatch}
          className={panelInputClassName}
          placeholder="Start typing your response..."
        />
      </section>

      <section className={sectionClassName}>
        <p className={sectionHeaderClassName}>Rubric Context</p>
        <label className={labelClassName}>Context for Grading</label>
        <textarea
          className={`${panelTextareaClassName} resize-y`}
          value={node.rubric.context}
          onChange={(e) =>
            updateRubric({
              ...node.rubric,
              context: e.target.value,
            })
          }
          placeholder="Describe expected content, constraints, or grading goals."
          rows={4}
        />
      </section>

      <section className={sectionClassName}>
        <div className="mb-3 flex items-center justify-between">
          <p className={sectionHeaderClassName}>Answer Buckets</p>
          <button
            type="button"
            className={panelPrimaryButtonClassName}
            onClick={addBucket}
          >
            Add Bucket
          </button>
        </div>
        <div className="space-y-2.5">
          {node.rubric.answerBuckets.map((bucket, index) => (
            <div
              key={bucket.id}
              className="flex items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/35 p-2"
            >
              <span className="w-8 text-center text-xs font-semibold text-slate-400">
                {index + 1}
              </span>
              <input
                type="text"
                className={panelInlineInputClassName}
                value={bucket.classifier}
                onChange={(e) =>
                  onBucketClassifierChange(bucket.id, e.target.value)
                }
                placeholder="Classifier text used to map to an edge"
              />
              <button
                type="button"
                className={panelDangerButtonClassName}
                onClick={() => removeBucket(bucket.id)}
                disabled={node.rubric.answerBuckets.length <= 1}
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
