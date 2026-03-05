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
    <aside className="flex-h-full w-48 shrink-0 flex-col select-none border-r border-slate-700/80 bg-slate-900 px-3 py-4 text-slate-100">
      <p className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-300/90">
        Add Node
      </p>
      <div className="mt-3 space-y-2">
        {Object.entries(nodeRegistry)
          .filter(([, nodeEntry]) => nodeEntry.type !== "start")
          .map(([type, nodeEntry]) => (
          <button
            key={type}
            type="button"
            className="w-full rounded-lg !border !border-slate-600/70 !bg-slate-800/70 !px-3 !py-2 text-left !text-sm font-medium capitalize !text-slate-100 transition hover:!border-sky-400/60 hover:!bg-slate-700/90"
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
