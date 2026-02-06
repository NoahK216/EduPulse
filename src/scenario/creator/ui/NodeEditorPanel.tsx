import type { GenericNode } from "../../nodes";

export type NodeEditorPanelProps ={
    selectedNode?: GenericNode;
}

const NodeEditorPanel = ({selectedNode}: NodeEditorPanelProps) => {
    return (
        <div className="min-h-full bg-gray-600 !mx-0 text-gray-100">
            {selectedNode?.id}
        </div>
    );

}

export default NodeEditorPanel;
