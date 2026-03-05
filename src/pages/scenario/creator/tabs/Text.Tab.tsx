import type { TextNode } from "../../nodeSchemas";
import { useEditorDispatch } from "../editor-store/EditorDispatchContext";
import { TextInputDispatch } from "./NodeDispatchFields";
import type { NodeTabProps } from "./TabRenderer";
import {
  labelClassName,
  panelInputClassName,
  panelTextareaClassName,
  sectionClassName,
  sectionHeaderClassName,
} from "./tabStyles";

export function TextTab({ node }: NodeTabProps<TextNode>) {
  const dispatch = useEditorDispatch();

  return (
    <>
      <section className={sectionClassName}>
        <p className={sectionHeaderClassName}>Question Setup</p>
        <label className={labelClassName}>Title</label>
        <TextInputDispatch
          node={node}
          path="title"
          className={panelInputClassName}
          placeholder="Title"
        />
        <label className={`${labelClassName} mt-4`}>Text</label>
        <textarea
          className={`${panelTextareaClassName} resize-y`}
          value={node.text}
          onChange={(e) =>
            dispatch({
              type: "updateNode",
              id: node.id,
              patch: {
                type: "text",
                text: e.target.value,
              },
            })
          }
          placeholder="Say something here"
          rows={5}
        />
      </section>
    </>
  );
}

