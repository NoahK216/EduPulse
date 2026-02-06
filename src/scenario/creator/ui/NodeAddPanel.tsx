import { nodeRegistry } from "../../nodes";
import { flowNodeFromGenericNode } from "../EditorScenarioSchemas";
import { type Node } from '@xyflow/react';

export type NodeAddPanelProps = {
    addNode: (node: Node) => void;
};


// TODO GENERATION SHOULD NOT BE DONE ON THE CLIENT
const NodeAddPanel = ({ addNode }: NodeAddPanelProps) => {
    const onNodeClick = (nodeEntry) => {
        addNode(flowNodeFromGenericNode(nodeEntry.factory()))
    }

    return (
        <div className="min-h-full w-fit bg-gray-600 !mx-0 text-gray-100">
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
