import type { VideoNode } from "../../nodeSchemas";
import { TextInputDispatch } from "./NodeDispatchFields";
import type { NodeTabProps } from "./TabRenderer";
import {
  labelClassName,
  panelInputClassName,
  sectionClassName,
  sectionHeaderClassName,
} from "./tabStyles";

export function VideoTab({ node, dispatch }: NodeTabProps<VideoNode>) {
  return (
    <>
      <section className={sectionClassName}>
        <p className={sectionHeaderClassName}>Video Setup</p>
        <label className={labelClassName}>Title</label>
        <TextInputDispatch
          node={node}
          path="title"
          dispatch={dispatch}
          className={panelInputClassName}
          placeholder="Video title"
        />
        <label className={`${labelClassName} mt-4`}>Video URL</label>
        <TextInputDispatch
          node={node}
          path="src"
          dispatch={dispatch}
          className={panelInputClassName}
          placeholder="https://..."
        />
        <label className={`${labelClassName} mt-4`}>Captions URL</label>
        <TextInputDispatch
          node={node}
          path="captionsSrc"
          dispatch={dispatch}
          className={panelInputClassName}
          placeholder="https://..."
        />
      </section>

      <section className={sectionClassName}>
        <p className={sectionHeaderClassName}>Playback</p>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700/70 bg-slate-900/35 p-3">
          <input
            type="checkbox"
            checked={Boolean(node.autoplay)}
            className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-sky-500 focus:ring-2 focus:ring-sky-400/40"
            onChange={(e) =>
              dispatch({
                type: "updateNode",
                id: node.id,
                patch: {
                  type: "video",
                  autoplay: e.target.checked,
                },
              })
            }
          />
          <div>
            <p className="text-sm font-medium text-slate-100">Autoplay video</p>
            <p className="text-xs text-slate-400">
              Starts playback when this node becomes active.
            </p>
          </div>
        </label>
      </section>
    </>
  );
}
