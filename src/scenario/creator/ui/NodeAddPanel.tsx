import { nodeRegistry } from "../../nodes";
import type { EditorDispatch } from "../EditorStore";

export type NodeAddPanelProps = {
    editorDispatch: EditorDispatch;
};


// TODO GENERATION SHOULD NOT BE DONE ON THE CLIENT
const NodeAddPanel = ({ editorDispatch }: NodeAddPanelProps) => {
    const onNodeClick = (nodeEntry) => {
        // addNode(flowNodeFromGenericNode(nodeEntry.factory()))
        editorDispatch({ type: "addNode", node: nodeEntry.factory() })
    }

    return (
        <aside className="h-full w-48 shrink-0 select-none border-r border-slate-700/80 bg-slate-900 px-3 py-4 text-slate-100">
            <p className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-300/90">
                Add Node
            </p>
            <div className="mt-3 space-y-2">
                {Object.entries(nodeRegistry).map(([type, nodeEntry]) => (
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

}

export default NodeAddPanel;
