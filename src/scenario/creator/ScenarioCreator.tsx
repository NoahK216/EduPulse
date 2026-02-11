import { useState, useCallback, useEffect, useReducer } from 'react';
import { type Scenario } from '../scenarioSchemas';
import { cards } from '../nodes';
import {
    ReactFlow, applyNodeChanges, addEdge,
    type Node,
    type Edge,
    type FitViewOptions,
    type OnConnect,
    type OnNodesChange,
    type DefaultEdgeOptions,
    Background,
    Controls,
    MiniMap,
    type ReactFlowInstance,
    type OnEdgesChange,
    applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeAddPanel from './ui/NodeAddPanel';
import MenuBar from './ui/MenuBar';
import NodeEditorPanel from './ui/NodeEditorPanel';
import { downloadJson } from './DownloadJson';
import { flowGraphFromScenario, loadScenario } from './import';
import { ScenarioImportButton } from './ui/ScenarioImportButton';
import { NodeInspectorProvider } from './cards/NodeCardFrame';

import { editorReducer } from './EditorStore';
import { dispatchOnEdgesChange, dispatchOnNodesChange } from './ScenarioCreatorCallbacks';


const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
};

// TODO rename initialNode to nodeData or something

const ScenarioCreator = ({ scenarioUrl }: { scenarioUrl?: string }) => {
    const [state, dispatch] = useReducer(editorReducer, { status: "idle" });

    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();
    const [rfNodes, setRfNodes] = useState<Node[]>([]);
    const [rfEdges, setRfEdges] = useState<Edge[]>([]);
    const inspectedNodeId = state.status === "loaded" ? state.ui.inspectedNodeId : null;

    const preserveReactFlowSelection = useCallback((nextNodes: Node[], prevNodes: Node[]) => {
        const selectedIds = new Set(
            prevNodes.filter((nodeSnapshot) => nodeSnapshot.selected).map((nodeSnapshot) => nodeSnapshot.id),
        );

        if (selectedIds.size === 0) return nextNodes;

        return nextNodes.map((nodeSnapshot) =>
            selectedIds.has(nodeSnapshot.id) ?
                { ...nodeSnapshot, selected: true } :
                nodeSnapshot,
        );
    }, []);

    const initializeEditor = (e: Scenario) => {
        dispatch({ type: "initScenario", scenario: e });
        requestAnimationFrame(() => reactFlowInstance?.fitView());
    }

    useEffect(() => {
        if (scenarioUrl) {
            loadScenario(scenarioUrl)
                .then((parsed) => {
                    initializeEditor(parsed);
                })
        }
    }, [scenarioUrl]);

    // Drives ReactFlow state by the SSoT: editorReducer
    useEffect(() => {
        if (state.status !== "loaded") return;
        console.log(state.doc)

        const { nodes, edges } = flowGraphFromScenario(state.doc);
        setRfNodes((nodesSnapshot) => {
            return preserveReactFlowSelection(nodes, nodesSnapshot);
        });
        setRfEdges(edges);
    }, [state.status, state.status === "loaded" ? state.doc : null, preserveReactFlowSelection, setRfNodes, setRfEdges]);


    const onConnect: OnConnect = useCallback(
        (params) => setRfEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            dispatchOnNodesChange(dispatch, changes);
            setRfNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot))
        },
        [dispatch],
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            dispatchOnEdgesChange(dispatch, changes);
            setRfEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot))
        },
        [],
    );

    const inspectNode = useCallback((nodeId: string) => {
        dispatch({ type: "inspectNode", id: nodeId });
    }, [dispatch]);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        if (node) {
            inspectNode(node.id);
        }
    },
        [inspectNode],
    );

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
            <MenuBar >
                {state.status === "loaded" &&
                    <button
                        className="inline-flex items-center rounded-md !border !border-sky-400/45 !bg-sky-500/10 !px-3 !py-1.5 !text-xs font-semibold uppercase tracking-[0.08em] !text-sky-100 transition hover:!bg-sky-500/20"
                        onClick={() =>
                        downloadJson(state.doc, "scenario.json")}
                    >
                        Download JSON
                    </button>
                }
                <ScenarioImportButton onLoaded={initializeEditor} />

            </MenuBar>
            <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
                <NodeAddPanel editorDispatch={dispatch} />
                <NodeInspectorProvider inspectedNodeId={inspectedNodeId} inspectNode={inspectNode}>
                    <ReactFlow
                        className="flex-1 min-h-0 min-w-0"
                        onInit={(instance) => setReactFlowInstance(instance)}
                        nodes={rfNodes}
                        edges={rfEdges}
                        nodeTypes={cards}
                        proOptions={{ hideAttribution: true }}

                        fitView
                        fitViewOptions={fitViewOptions}
                        defaultEdgeOptions={defaultEdgeOptions}
                        panOnDrag={[2]}
                        selectionOnDrag={true}

                        onNodeClick={onNodeClick}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        // TODO
                        onConnect={onConnect}
                        // onNodesDelete={ }
                        // onEdgesDelete={}
                    >
                        <Background />


                        {/* Panels */}
                        <MiniMap nodeStrokeWidth={3} />

                        {/* TODO Move these to toolbar below MenuBar */}
                        <Controls />
                    </ReactFlow>
                </NodeInspectorProvider>
                <NodeEditorPanel editorState={state} dispatch={dispatch} />
            </div>
        </div>
    );
}

export default ScenarioCreator;
