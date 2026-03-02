import { useState, useCallback, useEffect, useReducer } from "react";
import { type Scenario } from "../scenarioSchemas";
import { cards } from "../nodes";
import {
  ReactFlow,
  applyNodeChanges,
  addEdge,
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeAddPanel from "./ui/NodeAddPanel";
import MenuBar from "./ui/MenuBar";
import NodeEditorPanel from "./ui/NodeEditorPanel";
import { downloadJson } from "./DownloadJson";
import { flowGraphFromScenario, loadScenario } from "./import";
import { ScenarioImportButton } from "./ui/ScenarioImportButton";
import { NodeInspectorProvider } from "./cards/NodeCardFrame";

import { editorReducer } from "./EditorStore";
import {
  createEdgeFromConnection,
  dispatchOnEdgesChange,
  dispatchOnNodesChange,
  enforceSingleOutgoingConnectionPerHandle,
  toScenarioEdge,
} from "./ScenarioCreatorCallbacks";

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

// TODO rename initialNode to nodeData or something

const ScenarioCreator = ({ scenarioUrl }: { scenarioUrl?: string }) => {
  const [state, dispatch] = useReducer(editorReducer, { status: "idle" });

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();
  const [rfNodes, setRfNodes] = useState<Node[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);
  const inspectedNodeId =
    state.status === "loaded" ? state.ui.inspectedNodeId : null;
  const [tipNum, setTipNum] = useState<0 | 1 | 2 | 3 | 4 | 5>(1);
  const [tipOpen, setTipOpen] = useState(true);
  const [tipClosed, setTipClosed] = useState(false);

  const preserveReactFlowSelection = useCallback(
    (nextNodes: Node[], prevNodes: Node[]) => {
      const selectedIds = new Set(
        prevNodes
          .filter((nodeSnapshot) => nodeSnapshot.selected)
          .map((nodeSnapshot) => nodeSnapshot.id),
      );

      if (selectedIds.size === 0) return nextNodes;

      return nextNodes.map((nodeSnapshot) =>
        selectedIds.has(nodeSnapshot.id)
          ? { ...nodeSnapshot, selected: true }
          : nodeSnapshot,
      );
    },
    [],
  );

  const initializeEditor = (e: Scenario) => {
    dispatch({ type: "initScenario", scenario: e });
    requestAnimationFrame(() => reactFlowInstance?.fitView());
  };

  useEffect(() => {
    if (scenarioUrl) {
      loadScenario(scenarioUrl).then((parsed) => {
        initializeEditor(parsed);
      });
    }
  }, [scenarioUrl]);

  // Drives ReactFlow state by the SSoT: editorReducer
  useEffect(() => {
    if (state.status !== "loaded") return;
    console.log(state.doc);

    const { nodes, edges } = flowGraphFromScenario(state.doc);
    setRfNodes((nodesSnapshot) => {
      return preserveReactFlowSelection(nodes, nodesSnapshot);
    });
    setRfEdges(edges);
  }, [
    state.status,
    state.status === "loaded" ? state.doc : null,
    preserveReactFlowSelection,
    setRfNodes,
    setRfEdges,
  ]);

  const onConnect: OnConnect = useCallback(
    (params) => {
      const createdEdge = createEdgeFromConnection(params);
      if (!createdEdge) return;

      dispatch({ type: "addEdge", edge: toScenarioEdge(createdEdge) });
      setRfEdges((edgesSnapshot) =>
        enforceSingleOutgoingConnectionPerHandle(
          addEdge(createdEdge, edgesSnapshot),
        ),
      );
    },
    [dispatch],
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      dispatchOnNodesChange(dispatch, changes);
      setRfNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));
    },
    [dispatch],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      dispatchOnEdgesChange(dispatch, changes);
      setRfEdges((edgesSnapshot) =>
        enforceSingleOutgoingConnectionPerHandle(
          applyEdgeChanges(changes, edgesSnapshot),
        ),
      );
    },
    [dispatch],
  );

  const inspectNode = useCallback(
    (nodeId: string) => {
      dispatch({ type: "inspectNode", id: nodeId });
    },
    [dispatch],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      console.log("clicked type:", node.type, "id:", node.id);
      if (node) {
        inspectNode(node.id);
        if (node.type === "free_response") {
          setTimeout(() => {
            setTipNum(3);
            setTipOpen(true);
          });
          return;
        }
        if (node.type === "choice") {
          setTipNum(4);
          setTipOpen(true);
          return;
        }

        if (node.type === "video") {
          setTipNum(5);
          setTipOpen(true);
          return;
        }
      }
    },
    [inspectNode, tipNum],
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <MenuBar>
        {state.status === "loaded" && (
          <button
            className="inline-flex items-center rounded-md !border !border-sky-400/45 !bg-sky-500/10 !px-3 !py-1.5 !text-xs font-semibold uppercase tracking-[0.08em] !text-sky-100 transition hover:!bg-sky-500/20"
            onClick={() => downloadJson(state.doc, "scenario.json")}
          >
            Download JSON
          </button>
        )}
        <ScenarioImportButton onLoaded={initializeEditor} />
        <button
          className="inline-flex items-center rounded-md !border !border-sky-400/45 !bg-sky-500/10 !px-3 !py-1.5 !text-xs font-semibold uppercase tracking-[0.08em] !text-sky-100 transition hover:!bg-sky-500/20"
          onClick={() => {
            setTipClosed(false);
            setTipNum(1);
            setTipOpen(true);
          }}
        >
          Help
        </button>
      </MenuBar>
      {!tipClosed && tipOpen && tipNum !== 0 && (
        <div
          className="fixed z-50 max-w-sm rounded-lg border border-[#0b1f3a] bg-[#081426] p-4 text-blue-100 shadow-lg"
          style={{
            top:
              tipNum === 1
                ? 100
                : tipNum === 2
                  ? 140
                  : tipNum === 3
                    ? 300
                    : tipNum === 4
                      ? 350
                      : 250,
            left:
              tipNum === 1
                ? 215
                : tipNum === 2
                  ? 250
                  : tipNum === 5
                    ? 735
                    : 700,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">
                {tipNum === 1 && "Add nodes"}
                {tipNum === 2 && "Edit nodes"}
                {tipNum === 3 && "Free Response"}
                {tipNum === 4 && "Multiple Choice"}
                {tipNum === 5 && "Video node"}
              </div>

              <div className="mt-1 text-sm text-neutral-300">
                {tipNum === 1 &&
                  "Click a node in the left panel to add it to the scenario."}

                {tipNum === 2 &&
                  "Click any node on the canvas to edit its content on the right."}
                {tipNum === 3 && (
                  <div className="space-y-2">
                    <div>
                      <b>Prompt</b>: The question
                    </div>
                    <div>
                      <b>Rubric Context</b>: Context for the AI grader to use
                    </div>
                    <div>
                      <b>Answer Buckets</b>: How the responses should be scored
                    </div>
                  </div>
                )}
                {tipNum === 4 &&
                  "Input prompt and add as many choices as necessary."}
                {tipNum === 5 &&
                  "Edit title, video, and captions if available."}
              </div>
            </div>

            <button
              type="button"
              className="ml-2 !bg-blue-950 !text-blue-200 hover:!bg-blue-900 rounded-md px-2 py-1 transition"
              onClick={() => {
                setTipClosed(true);
                setTipOpen(false);
              }}
            >
              {" "}
              X
            </button>
          </div>
        </div>
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
        <NodeAddPanel
          editorDispatch={dispatch}
          onAddNode={() => {
            if (tipNum === 1) {
              setTipNum(2);
              setTipOpen(true);
            }
          }}
        />
        <NodeInspectorProvider
          inspectedNodeId={inspectedNodeId}
          inspectNode={inspectNode}
        >
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
};

export default ScenarioCreator;
