import type { EditorAction, EditorState } from "../EditorStore";
import { TabRenderer } from "../tabs/TabRenderer";

export type NodeEditorPanelProps = {
    editorState?: EditorState;
    dispatch: React.ActionDispatch<[action: EditorAction]>;
}


const NodeEditorPanel = ({ editorState, dispatch }: NodeEditorPanelProps) => {
    const doc = (editorState && editorState.status === "loaded") ? editorState.doc : null;
    const ui = (editorState && editorState.status === "loaded") ? editorState.ui : null;
    const node = doc?.nodes[ui?.selectedNodeId!];


    return (
        <>
            {node &&
                <div className="min-h-full max-w-50 bg-gray-600 !mx-0 text-gray-100">
                    <TabRenderer node={node} dispatch={dispatch} />
                </div>
            }</>
    );

}

export default NodeEditorPanel;
