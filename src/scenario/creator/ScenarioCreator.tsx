import { useState, useCallback, useEffect } from 'react';
import { type Scenario } from '../scenarioSchemas';
import { cards } from '../nodes';
import {
    ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge,
    type Node,
    type Edge,
    type FitViewOptions,
    type OnConnect,
    type OnNodesChange,
    type OnEdgesChange,
    type DefaultEdgeOptions,
    Background,
    Controls,
    MiniMap,
    type OnSelectionChangeFunc,
    type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeAddPanel from './ui/NodeAddPanel';
import MenuBar from './ui/MenuBar';
import NodeEditorPanel from './ui/NodeEditorPanel';
import { exportScenarioToJSON, reactFlowToScenario } from './export';
import { downloadJson } from './DownloadJson';
import { flowGraphFromScenario, loadScenario } from './import';
import { ScenarioImportButton } from './ui/ScenarioImportButton';


const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
};

// TODO rename initialNode to nodeData or something

const ScenarioCreator = ({ scenarioUrl }: { scenarioUrl?: string }) => {
    const [scenario, setScenario] = useState<Scenario | undefined>();
    const [scenarioState, setScenarioState] = useState<'loading' | 'creating' | 'error'>(scenarioUrl ? 'loading' : 'creating')
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();


    const addNode = (node: Node) => {
        setNodes([...nodes, node]);
    }

    const initializeEditor = (e: Scenario) => {
        setScenario(e);
        const { nodes, edges } = flowGraphFromScenario(e);
        setNodes(nodes);
        setEdges(edges);
        reactFlowInstance?.fitView()
    }

    // No context menu on right click
    // useEffect(() => {
    //     const handleContextMenu = (e: Event) => {
    //         e.preventDefault();
    //     };
    //     document.addEventListener('contextmenu', handleContextMenu);
    //     return () => {
    //         document.removeEventListener('contextmenu', handleContextMenu);
    //     };
    // }, []);

    useEffect(() => {
        if (scenarioUrl) {
            loadScenario(scenarioUrl)
                .then((parsed) => {
                    initializeEditor(parsed);
                })
                .catch((error) => {
                    const message = error instanceof Error ? error.message : "Failed to load scenario";
                    setErrorMessage(message);
                    setScenarioState('error');
                })
        }
    }, [scenarioUrl]);


    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    const onConnect: OnConnect = useCallback(
        (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    const onSelectionChange: OnSelectionChangeFunc = useCallback(
        (params) => { console.log(params) },
        [],
    );

    return (
        <div className="w-screen h-screen flex flex-col">
            <MenuBar >
                <button onClick={() =>
                    downloadJson(exportScenarioToJSON(reactFlowToScenario(nodes, edges, scenario!)), "scenario.json")
                } >
                    Download JSON
                </button>
                <ScenarioImportButton onLoaded={initializeEditor} />

            </MenuBar>
            <div className='h-full flex flex-row'>
                <NodeAddPanel addNode={addNode} />
                <ReactFlow
                    className="flex-1 min-h-0"
                    onInit={(instance) => setReactFlowInstance(instance)}
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={cards}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    fitViewOptions={fitViewOptions}
                    defaultEdgeOptions={defaultEdgeOptions}
                    panOnDrag={[2]}
                    selectionOnDrag={true}
                    onSelectionChange={onSelectionChange}
                >
                    <Background />


                    {/* Panels */}
                    <MiniMap nodeStrokeWidth={3} />

                    {/* TODO Move these to toolbar below MenuBar */}
                    <Controls />
                </ReactFlow>
                <NodeEditorPanel />
            </div>
        </div>
    );
}

export default ScenarioCreator;
