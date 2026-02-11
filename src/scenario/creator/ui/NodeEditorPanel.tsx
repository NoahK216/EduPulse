import { useEffect, useRef, useState } from "react";
import type { EditorDispatch, EditorState } from "../EditorStore";
import { TabRenderer } from "../tabs/TabRenderer";

const DEFAULT_PANEL_WIDTH = 380;
const MIN_PANEL_WIDTH = 300;
const MAX_PANEL_WIDTH = 640;

export type NodeEditorPanelProps = {
    editorState?: EditorState;
    dispatch: EditorDispatch;
}

const NodeEditorPanel = ({ editorState, dispatch }: NodeEditorPanelProps) => {
    const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
    const dragState = useRef<{
        pointerId: number | null;
        startX: number;
        startWidth: number;
    }>({
        pointerId: null,
        startX: 0,
        startWidth: DEFAULT_PANEL_WIDTH,
    });

    const clampWidth = (width: number) => {
        return Math.min(Math.max(width, MIN_PANEL_WIDTH), MAX_PANEL_WIDTH);
    };

    const finishResize = () => {
        dragState.current.pointerId = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    };

    const onResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
        dragState.current.pointerId = event.pointerId;
        dragState.current.startX = event.clientX;
        dragState.current.startWidth = panelWidth;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const onResizeMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (dragState.current.pointerId !== event.pointerId) return;
        const deltaX = dragState.current.startX - event.clientX;
        const nextWidth = clampWidth(dragState.current.startWidth + deltaX);
        setPanelWidth(nextWidth);
    };

    const onResizeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
        if (dragState.current.pointerId !== event.pointerId) return;
        event.currentTarget.releasePointerCapture(event.pointerId);
        finishResize();
    };

    const onResizeCancel = () => {
        finishResize();
    };

    useEffect(() => {
        return () => {
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, []);

    const doc = (editorState && editorState.status === "loaded") ? editorState.doc : null;
    const ui = (editorState && editorState.status === "loaded") ? editorState.ui : null;
    const node = doc?.nodes[ui?.inspectedNodeId!];
    const onCloseEditor = () => dispatch({ type: "inspectNode", id: null });

    if (!node) return null;

    return (
        <aside
            className="relative flex h-full shrink-0 border-l border-slate-700/80 bg-slate-900 text-slate-100 shadow-[0_0_30px_rgba(0,0,0,0.35)]"
            style={{
                width: clampWidth(panelWidth),
                minWidth: MIN_PANEL_WIDTH,
                maxWidth: MAX_PANEL_WIDTH,
            }}
        >
            <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize editor panel"
                className="group absolute inset-y-0 left-0 z-20 w-2 cursor-col-resize touch-none"
                onPointerDown={onResizeStart}
                onPointerMove={onResizeMove}
                onPointerUp={onResizeEnd}
                onPointerCancel={onResizeCancel}
                onDoubleClick={() => setPanelWidth(DEFAULT_PANEL_WIDTH)}
            >
                <div className="absolute inset-y-0 left-0 w-px bg-slate-600/70 transition group-hover:bg-sky-300/80" />
            </div>
            <div className="h-full min-w-0 flex-1 overflow-hidden">
                <TabRenderer node={node} dispatch={dispatch} onClose={onCloseEditor} />
            </div>
        </aside>
    );
}

export default NodeEditorPanel;
