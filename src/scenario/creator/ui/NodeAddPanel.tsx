import { nodeRegistry } from "../../nodes";
import type { EditorAction } from "../EditorStore";

export type NodeAddPanelProps = {
    editorDispatch: React.ActionDispatch<[action: EditorAction]>;
};


// TODO GENERATION SHOULD NOT BE DONE ON THE CLIENT
const NodeAddPanel = ({ editorDispatch }: NodeAddPanelProps) => {
    const onNodeClick = (nodeEntry) => {
        // addNode(flowNodeFromGenericNode(nodeEntry.factory()))
        editorDispatch({ type: "addNode", node: nodeEntry.factory() })
    }

    return (
        <div className="min-h-full w-fit select-none bg-gray-600 !mx-0 text-gray-100">
            {Object.entries(nodeRegistry).map(([type, nodeEntry]) => (
                <div
                    key={type}
                    className="rounded-sm p-2 m-2 hover:bg-gray-300 cursor-pointer"
                    onClick={() => onNodeClick(nodeEntry)}
                >
                    {nodeEntry.type}
                </div>
            ))}
        </div>
    );

}

export default NodeAddPanel;
