import { nodeRegistry } from "../../nodes";
import { useEditorDispatch } from "../editor-store/EditorDispatchContext";

export type NodeAddPanelProps = {
  onAddNode?: () => void;
};

// TODO GENERATION SHOULD NOT BE DONE ON THE CLIENT
const NodeAddPanel = ({ onAddNode }: NodeAddPanelProps) => {
  const dispatch = useEditorDispatch();

  const onNodeClick = (nodeEntry) => {
    dispatch({ type: "addNode", node: nodeEntry.factory() });
    onAddNode?.();
  };

  return (
    <aside className="flex-h-full w-48 shrink-0 flex-col select-none border-r px-3 py-4 border-slate-300 bg-gray-200 text-slate-900 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100">
      <p className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-800 dark:text-sky-300/90">
        Add Node
      </p>
      <div className="mt-3 space-y-2">
        {Object.entries(nodeRegistry)
          .filter(([, nodeEntry]) => nodeEntry.type !== "start")
          .map(([type, nodeEntry]) => (
            <button
              key={type}
              type="button"
              className="w-full rounded-lg !border !px-3 !py-2 text-left !text-sm font-medium capitalize transition !border-slate-500 !bg-slate-100 !text-slate-800 hover:!border-sky-500 hover:!bg-slate-200 dark:!border-slate-600/70 dark:!bg-slate-800/70 dark:!text-slate-100 dark:hover:!border-sky-400/60 dark:hover:!bg-slate-700/90"
              onClick={() => onNodeClick(nodeEntry)}
            >
              {nodeEntry.type.replace("_", " ")}
            </button>
          ))}
      </div>
    </aside>
  );
};

export default NodeAddPanel;
