import { useState, useCallback, useEffect } from 'react';
import { flowGraphFromEditorScenario, loadEditorScenario, type EditorScenario } from './EditorScenarioSchemas';
import { cards } from '../nodes';
import {
    ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge,
    type Node,
    type Edge,
    type FitViewOptions,
    type OnConnect,
    type OnNodesChange,
    type OnEdgesChange,
    type OnNodeDrag,
    type DefaultEdgeOptions,
    Background,
    Controls,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';


const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
};

const ScenarioCreator = ({ scenarioUrl }: { scenarioUrl?: string }) => {
    const [editorScenario, setEditorScenario] = useState<EditorScenario | undefined>();
    const [scenarioState, setScenarioState] = useState<'loading' | 'creating' | 'error'>(scenarioUrl ? 'loading' : 'creating')
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const initializeEditor = (e: EditorScenario) => {
        setEditorScenario(e);
        const { nodes, edges } = flowGraphFromEditorScenario(e);
        setNodes(nodes);
        setEdges(edges);
        console.log(nodes, edges)
    }

    useEffect(() => {
        if (scenarioUrl) {
            loadEditorScenario(scenarioUrl)
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

    // const exportStateAsJSON = () => {
    // }

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

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={cards}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                fitViewOptions={fitViewOptions}
                defaultEdgeOptions={defaultEdgeOptions}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}

export default ScenarioCreator;
