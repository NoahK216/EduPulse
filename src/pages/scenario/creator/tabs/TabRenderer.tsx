import { tabs, type GenericNode } from "../../nodes";
import type { EditorDispatch } from "../EditorStore";

export type NodeTabProps<N extends GenericNode = GenericNode> = {
  node: N;
  dispatch: EditorDispatch;
  onClose?: () => void;
};

const NODE_TYPE_LABELS: Record<GenericNode["type"], string> = {
  video: "Video",
  choice: "Multiple Choice",
  free_response: "Free Response",
};

export function TabRenderer(props: NodeTabProps) {
  const { node, onClose } = props;
  const Renderer = tabs[node.type] as React.ComponentType<
    NodeTabProps<typeof node>
  >;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <header className="flex items-center justify-between border-b border-slate-700/80 bg-slate-900/90 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-300/90">
          {NODE_TYPE_LABELS[node.type]} Node
        </p>
        {onClose && (
          <button
            type="button"
            aria-label="Close editor"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md !border !border-slate-600/70 !bg-slate-800/70 !p-0 text-xs font-semibold !text-slate-200 transition hover:!border-red-400/70 hover:!bg-red-500/10 hover:!text-red-200"
            onClick={onClose}
          >
            X
          </button>
        )}
      </header>
      <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto px-5 py-5">
        <Renderer {...props} node={node} />
      </div>
    </div>
  );
}
