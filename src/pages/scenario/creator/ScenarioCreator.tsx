import { useState, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type Scenario } from "../scenarioSchemas";
import { cards } from "../nodes";
import {
  ReactFlow,
  applyNodeChanges,
  addEdge,
  type Connection,
  type ConnectionLineComponentProps,
  ConnectionLineType,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  Position,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnConnectStart,
  type OnConnectEnd,
  type OnNodesChange,
  type NodeMouseHandler,
  type DefaultEdgeOptions,
  Background,
  MiniMap,
  type ReactFlowInstance,
  type OnEdgesChange,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeAddPanel from "./ui/NodeAddPanel";
import CreatorTopBar from "./ui/CreatorTopBar";
import NodeEditorPanel from "./ui/NodeEditorPanel";
import { downloadJson } from "./DownloadJson";
import { flowGraphFromScenario, loadScenario } from "./import";
import { NodeInspectorProvider } from "./cards/NodeCardFrame";
import { EditorDispatchProvider } from "./editor-store/EditorDispatchContext";
import {
  ApiRequestError,
  publicApiPost,
  resolvePublicApiToken,
} from "../../../lib/public-api-client";
import type { ItemResponse, PublicScenario } from "../../../types/publicApi";

import { editorReducer } from "./editor-store/EditorStore";
import {
  createEdgeFromConnection,
  dispatchOnEdgesChange,
  dispatchOnNodesChange,
  enforceSingleOutgoingConnectionPerHandle,
  toScenarioEdge,
} from "./ScenarioCreatorCallbacks";
import { buildStarterScenario } from "./starterScenario";
import type {
  CreatorStatusTone,
} from "./ui/menus/menuTypes";

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

type SyncStatus = "idle" | "syncing" | "success" | "error";

type ScenarioCreatorProps = {
  scenarioUrl?: string;
  initialScenario?: Scenario;
  initialScenarioId?: number | null;
};

const TUTORIAL_TOP_OFFSET = 84;

const ScenarioCreator = ({
  scenarioUrl,
  initialScenario,
  initialScenarioId,
}: ScenarioCreatorProps) => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(editorReducer, { status: "idle" });
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();
  const [rfNodes, setRfNodes] = useState<Node[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);
  const [activeConnectionSource, setActiveConnectionSource] = useState<{
    nodeId: string;
    handleId: string | null;
  } | null>(null);
  const [snapTargetNodeId, setSnapTargetNodeId] = useState<string | null>(null);
  const activeConnectionSourceRef = useRef<{
    nodeId: string;
    handleId: string | null;
  } | null>(null);
  const snapTargetNodeIdRef = useRef<string | null>(null);
  const rfNodesRef = useRef<Node[]>([]);
  const inspectedNodeId =
    state.status === "loaded" ? state.ui.inspectedNodeId : null;
  const [tipNum, setTipNum] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [tipOpen, setTipOpen] = useState(false);
  const [tipClosed, setTipClosed] = useState(true);
  const [syncedScenarioId, setSyncedScenarioId] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncMessage, setSyncMessage] = useState<string>("");
  const [baselineSerializedDoc, setBaselineSerializedDoc] = useState<
    string | null
  >(null);

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

  const initializeEditor = useCallback(
    (scenario: Scenario, scenarioId?: number | null) => {
      dispatch({ type: "initScenario", scenario });
      setSyncedScenarioId(scenarioId ?? null);
      setSyncStatus("idle");
      setSyncMessage("");
      setBaselineSerializedDoc(JSON.stringify(scenario));
      requestAnimationFrame(() => reactFlowInstance?.fitView());
    },
    [reactFlowInstance],
  );

  const currentSerializedDoc =
    state.status === "loaded" ? JSON.stringify(state.doc) : null;
  const isDirty =
    state.status === "loaded" &&
    baselineSerializedDoc !== null &&
    currentSerializedDoc !== baselineSerializedDoc;

  const confirmDiscardUnsavedChanges = useCallback(
    (actionLabel: string) => {
      if (!isDirty) return true;
      return window.confirm(
        `You have unsaved changes. Continue to ${actionLabel}?`,
      );
    },
    [isDirty],
  );

  const reopenTutorial = useCallback(() => {
    setTipClosed(false);
    setTipNum(1);
    setTipOpen(true);
  }, []);

  const openTutorialScenario = useCallback(() => {
    const tutorialUrl = new URL("/EdupulseTutorial.mp4", window.location.origin);
    window.open(tutorialUrl.toString(), "_blank", "noopener,noreferrer");
  }, []);


  useEffect(() => {
    if (!scenarioUrl) return;
    loadScenario(scenarioUrl)
      .then((parsed) => {
        initializeEditor(parsed);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [scenarioUrl, initializeEditor]);

  useEffect(() => {
    if (!initialScenario) return;
    initializeEditor(initialScenario, initialScenarioId ?? null);
  }, [initialScenario, initialScenarioId, initializeEditor]);

  // Drives ReactFlow state by the SSoT: editorReducer
  useEffect(() => {
    if (state.status !== "loaded") return;

    const { nodes, edges } = flowGraphFromScenario(state.doc);
    setRfNodes((nodesSnapshot) => {
      return preserveReactFlowSelection(nodes, nodesSnapshot);
    });
    setRfEdges(edges);
  }, [state, preserveReactFlowSelection, setRfNodes, setRfEdges]);

  useEffect(() => {
    rfNodesRef.current = rfNodes;
  }, [rfNodes]);

  const applyConnection = useCallback(
    (connection: Connection) => {
      const createdEdge = createEdgeFromConnection(connection);
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

  const onConnect: OnConnect = useCallback(
    (params) => {
      applyConnection(params);
    },
    [applyConnection],
  );

  const onConnectStart: OnConnectStart = useCallback((_, params) => {
    if (params.handleType !== "source" || !params.nodeId) {
      activeConnectionSourceRef.current = null;
      snapTargetNodeIdRef.current = null;
      setActiveConnectionSource(null);
      setSnapTargetNodeId(null);
      return;
    }

    const sourceSnapshot = {
      nodeId: params.nodeId,
      handleId: params.handleId,
    };
    activeConnectionSourceRef.current = sourceSnapshot;
    snapTargetNodeIdRef.current = null;
    setActiveConnectionSource(sourceSnapshot);
    setSnapTargetNodeId(null);
  }, []);

  const getSnapTargetHandlePosition = useCallback(
    (nodeId: string) => {
      if (!reactFlowInstance) return null;

      const escapedNodeId =
        typeof CSS !== "undefined" && typeof CSS.escape === "function"
          ? CSS.escape(nodeId)
          : nodeId;
      const handleElement = document.querySelector<HTMLElement>(
        `.react-flow__node[data-id="${escapedNodeId}"] .react-flow__handle.target`,
      );
      if (!handleElement) return null;

      const handleBounds = handleElement.getBoundingClientRect();
      return reactFlowInstance.screenToFlowPosition({
        x: handleBounds.left + handleBounds.width / 2,
        y: handleBounds.top + handleBounds.height / 2,
      });
    },
    [reactFlowInstance],
  );

  const snapConnectionLine = useCallback(
    ({
      connectionLineType,
      connectionLineStyle,
      fromX,
      fromY,
      toX,
      toY,
      fromPosition,
      toPosition,
    }: ConnectionLineComponentProps) => {
      let resolvedToX = toX;
      let resolvedToY = toY;
      let resolvedToPosition = toPosition;

      if (
        activeConnectionSource &&
        snapTargetNodeId &&
        snapTargetNodeId !== activeConnectionSource.nodeId
      ) {
        const targetHandlePosition =
          getSnapTargetHandlePosition(snapTargetNodeId);
        if (targetHandlePosition) {
          resolvedToX = targetHandlePosition.x;
          resolvedToY = targetHandlePosition.y;
          resolvedToPosition = Position.Left;
        }
      }

      const pathParams = {
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX: resolvedToX,
        targetY: resolvedToY,
        targetPosition: resolvedToPosition,
      };

      let path: string;
      switch (connectionLineType) {
        case ConnectionLineType.Straight:
          [path] = getStraightPath(pathParams);
          break;
        case ConnectionLineType.Step:
          [path] = getSmoothStepPath({ ...pathParams, borderRadius: 0 });
          break;
        case ConnectionLineType.SmoothStep:
          [path] = getSmoothStepPath(pathParams);
          break;
        default:
          [path] = getBezierPath(pathParams);
          break;
      }

      return (
        <path
          style={connectionLineStyle}
          d={path}
          fill="none"
          className="react-flow__connection-path"
        />
      );
    },
    [activeConnectionSource, getSnapTargetHandlePosition, snapTargetNodeId],
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (_, connectionState) => {
      const sourceSnapshot = activeConnectionSourceRef.current;
      const targetNodeId = snapTargetNodeIdRef.current;

      activeConnectionSourceRef.current = null;
      snapTargetNodeIdRef.current = null;
      setActiveConnectionSource(null);
      setSnapTargetNodeId(null);

      if (!sourceSnapshot || connectionState.isValid || !targetNodeId) return;
      if (targetNodeId === sourceSnapshot.nodeId) return;

      const targetNode = rfNodesRef.current.find(
        (nodeSnapshot) => nodeSnapshot.id === targetNodeId,
      );
      if (!targetNode || targetNode.type === "start") return;

      applyConnection({
        source: sourceSnapshot.nodeId,
        sourceHandle: sourceSnapshot.handleId,
        target: targetNode.id,
        targetHandle: null,
      });
    },
    [applyConnection],
  );

  const updateSnapTarget: NodeMouseHandler = useCallback(
    (_, nodeSnapshot) => {
      const sourceSnapshot = activeConnectionSourceRef.current;
      if (!sourceSnapshot) return;

      if (
        nodeSnapshot.type === "start" ||
        nodeSnapshot.id === sourceSnapshot.nodeId
      ) {
        snapTargetNodeIdRef.current = null;
        setSnapTargetNodeId(null);
        return;
      }

      snapTargetNodeIdRef.current = nodeSnapshot.id;
      setSnapTargetNodeId(nodeSnapshot.id);
    },
    [],
  );

  const onNodeMouseLeave: NodeMouseHandler = useCallback((_, nodeSnapshot) => {
    if (snapTargetNodeIdRef.current === nodeSnapshot.id) {
      snapTargetNodeIdRef.current = null;
    }
    setSnapTargetNodeId((currentTargetNodeId) =>
      currentTargetNodeId === nodeSnapshot.id ? null : currentTargetNodeId,
    );
  }, []);

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
      if (!node) return;
      if (node.type === "start") return;

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
      }
    },
    [inspectNode],
  );

  const syncScenarioDraft = useCallback(async () => {
    if (state.status !== "loaded") return;

    const scenarioSnapshot = state.doc;
    const serializedSnapshot = JSON.stringify(scenarioSnapshot);
    const wasUnsyncedScenario = syncedScenarioId === null;

    setSyncStatus("syncing");
    setSyncMessage("");

    try {
      const token = await resolvePublicApiToken();
      if (!token) {
        throw new Error("No auth token available. Please log in.");
      }

      const response = await publicApiPost<ItemResponse<PublicScenario>>(
        "/api/public/scenarios",
        token,
        {
          scenario_id: syncedScenarioId ?? undefined,
          title: scenarioSnapshot.title,
          description: null,
          draft_content: scenarioSnapshot,
        },
      );

      setSyncedScenarioId(response.item.id);
      setSyncStatus("success");
      setSyncMessage(
        `Synced scenario #${response.item.id} at ${new Date().toLocaleTimeString()}`,
      );
      setBaselineSerializedDoc(serializedSnapshot);

      if (wasUnsyncedScenario) {
        navigate(`/scenario/${response.item.id}/editor`, { replace: true });
      }
    } catch (error) {
      setSyncStatus("error");
      if (error instanceof ApiRequestError) {
        setSyncMessage(error.message);
        return;
      }
      if (error instanceof Error) {
        setSyncMessage(error.message);
        return;
      }
      setSyncMessage("Failed to sync scenario");
    }
  }, [navigate, state, syncedScenarioId]);

  const handleLogoClick = useCallback(() => {
    if (!confirmDiscardUnsavedChanges("open the homepage")) return;
    navigate("/");
  }, [confirmDiscardUnsavedChanges, navigate]);

  const handleCreateNewScenario = useCallback(() => {
    if (!confirmDiscardUnsavedChanges("create a new scenario")) return;
    initializeEditor(buildStarterScenario());
  }, [confirmDiscardUnsavedChanges, initializeEditor]);

  const handleOpenScenarioLibrary = useCallback(() => {
    if (!confirmDiscardUnsavedChanges("open the Scenario Library")) return;
    navigate("/scenario/library");
  }, [confirmDiscardUnsavedChanges, navigate]);

  const handleBeforeImport = useCallback(() => {
    return confirmDiscardUnsavedChanges("import a scenario");
  }, [confirmDiscardUnsavedChanges]);

  const handleImportedScenarioLoaded = useCallback(
    (scenario: Scenario) => {
      initializeEditor(scenario);
    },
    [initializeEditor],
  );

  const handleSaveDraft = useCallback(() => {
    void syncScenarioDraft();
  }, [syncScenarioDraft]);

  const handleTestScenario = useCallback(() => {
    syncScenarioDraft();
    navigate(`/scenario/${syncedScenarioId}/viewer`);
  }, [navigate, syncScenarioDraft, syncedScenarioId]);

  const handleDownloadJson = useCallback(() => {
    if (state.status !== "loaded") return;
    downloadJson(state.doc, "scenario.json");
  }, [state]);

  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut();
  }, [reactFlowInstance]);

  const handleResetZoom = useCallback(() => {
    if (!reactFlowInstance) return;
    const viewport = reactFlowInstance.getViewport();
    void reactFlowInstance.setViewport({ ...viewport, zoom: 1 });
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView(fitViewOptions);
  }, [reactFlowInstance]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;

      const key = event.key.toLowerCase();

      if (key === "n" && !event.shiftKey) {
        event.preventDefault();
        handleCreateNewScenario();
        return;
      }

      if (key === "s") {
        event.preventDefault();
        if (event.shiftKey) {
          handleDownloadJson();
          return;
        }

        handleSaveDraft();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleCreateNewScenario, handleDownloadJson, handleSaveDraft]);

  const topBarStatus = useMemo(() => {
    if (state.status !== "loaded") {
      return {
        message: "Loading scenario...",
        tone: "neutral" as CreatorStatusTone,
      };
    }

    if (syncStatus === "syncing") {
      return {
        message: "Saving...",
        tone: "neutral" as CreatorStatusTone,
      };
    }

    if (syncStatus === "error") {
      return {
        message: syncMessage || "Save failed",
        tone: "error" as CreatorStatusTone,
      };
    }

    if (isDirty) {
      return {
        message: "Unsaved changes",
        tone: "warning" as CreatorStatusTone,
      };
    }

    return {
      message: `All changes saved`,
      tone:
        syncStatus === "success"
          ? ("success" as CreatorStatusTone)
          : ("neutral" as CreatorStatusTone),
    };
  }, [state.status, syncStatus, syncMessage, isDirty]);

  return (
    <EditorDispatchProvider dispatch={dispatch}>
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <CreatorTopBar
        title={state.status === "loaded" ? state.doc.title : ""}
        titleDisabled={state.status !== "loaded"}
        onLogoClick={handleLogoClick}
        onTitleChange={(title) => dispatch({ type: "setScenarioTitle", title })}
        fileActions={{
          onNewScenario: handleCreateNewScenario,
          onOpenLibrary: handleOpenScenarioLibrary,
          onBeforeImport: handleBeforeImport,
          onImportScenarioLoaded: handleImportedScenarioLoaded,
          onSaveDraft: handleSaveDraft,
          onTestScenario: handleTestScenario,
          onDownloadJson: handleDownloadJson,
          saveDisabled: state.status !== "loaded" || syncStatus === "syncing",
          downloadDisabled: state.status !== "loaded",
          saveLabel: syncStatus === "syncing" ? "Saving..." : "Save",
        }}
        editActions={{
          onUndo: undefined,
          onRedo: undefined,
        }}
        viewActions={{
          onZoomIn: handleZoomIn,
          onZoomOut: handleZoomOut,
          onResetZoom: handleResetZoom,
          onFitView: handleFitView,
          disabled: !reactFlowInstance,
        }}
        helpActions={{
          onShowTutorial: reopenTutorial,
          onOpenTutorial: openTutorialScenario,
          onShowKeyboardShortcuts: undefined,
        }}
        statusMessage={topBarStatus.message}
        statusTone={topBarStatus.tone}
      />
      {!tipClosed && tipOpen && tipNum !== 0 && (
        <div
          className="fixed z-50 max-w-sm rounded-lg border border-[#0b1f3a] bg-[#081426] p-4 text-blue-100 shadow-lg"
          style={{
            top:
              (tipNum === 1
                ? 100
                : tipNum === 2
                  ? 140
                  : tipNum === 3
                    ? 300
                    : tipNum === 4
                      ? 350
                      : 250) + TUTORIAL_TOP_OFFSET,
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
              className="ml-2 rounded-md !bg-blue-950 px-2 py-1 !text-blue-200 transition hover:!bg-blue-900"
              onClick={() => {
                setTipClosed(true);
                setTipOpen(false);
              }}
            >
              X
            </button>
          </div>
        </div>
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
        <NodeAddPanel
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
            className="min-h-0 min-w-0 flex-1"
            onInit={(instance) => setReactFlowInstance(instance)}
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={cards}
            proOptions={{ hideAttribution: true }}
            fitView
            fitViewOptions={fitViewOptions}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineComponent={snapConnectionLine}
            panOnDrag={[2]}
            selectionOnDrag={true}
            onNodeClick={onNodeClick}
            onNodeMouseEnter={updateSnapTarget}
            onNodeMouseMove={updateSnapTarget}
            onNodeMouseLeave={onNodeMouseLeave}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnectStart={onConnectStart}
            onConnect={onConnect}
            onConnectEnd={onConnectEnd}
          >
            <Background />
            <MiniMap nodeStrokeWidth={3} />
          </ReactFlow>
        </NodeInspectorProvider>
        <NodeEditorPanel editorState={state} />
      </div>
      </div>
    </EditorDispatchProvider>
  );
};

export default ScenarioCreator;
