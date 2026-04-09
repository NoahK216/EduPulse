import { NODE_TYPE_LABELS, tabs, type GenericNode } from "../../nodes";

export type NodeTabProps<N extends GenericNode = GenericNode> = {
  node: N;
  onClose?: () => void;
};

export function TabRenderer(props: NodeTabProps) {
  const { node, onClose } = props;
  const Renderer = tabs[node.type] as React.ComponentType<
    NodeTabProps<typeof node>
  >;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <header className="flex items-center justify-between border-b px-5 py-4 border-slate-300 bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900/90">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-800 dark:text-sky-300/90">
          {NODE_TYPE_LABELS[node.type]} Node
        </p>
        {onClose && (
          <button
            type="button"
            aria-label="Close editor"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md !border !p-0 text-xs font-semibold transition !border-slate-400 !bg-white !text-slate-700 hover:!border-red-500 hover:!bg-red-50 hover:!text-red-700 dark:!border-slate-600/70 dark:!bg-slate-800/70 dark:!text-slate-200 dark:hover:!border-red-400/70 dark:hover:!bg-red-500/10 dark:hover:!text-red-200"
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
