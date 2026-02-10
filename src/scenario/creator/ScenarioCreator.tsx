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
        setRfNodes(nodes);
        setRfEdges(edges);
    }, [state.status, state.status === "loaded" ? state.doc : null, setRfNodes, setRfEdges]);


    const onConnect: OnConnect = useCallback(
        (params) => setRfEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            dispatchOnNodesChange(dispatch, changes);
            setRfNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot))
        },
        [],
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            dispatchOnEdgesChange(dispatch, changes);
            setRfEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot))
        },
        [],
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        if (node) {
            dispatch({ type: "selectNode", id: node.id })
        }
    },
        [],
    );

    return (
        <div className="w-screen h-screen flex flex-col">
            <MenuBar >
                {state.status === "loaded" &&
                    <button onClick={() =>
                        downloadJson(state.doc, "scenario.json")}
                    >
                        Download JSON
                    </button>
                }
                <ScenarioImportButton onLoaded={initializeEditor} />

            </MenuBar>
            <div className='h-full flex flex-row'>
                <NodeAddPanel editorDispatch={dispatch} />
                <ReactFlow
                    className="flex-1 min-h-0"
                    onInit={(instance) => setReactFlowInstance(instance)}
                    nodes={rfNodes}
                    edges={rfEdges}
                    nodeTypes={cards}

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
                <NodeEditorPanel editorState={state} dispatch={dispatch} />
            </div>
        </div>
    );
}

export default ScenarioCreator;
