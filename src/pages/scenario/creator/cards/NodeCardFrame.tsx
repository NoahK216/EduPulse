import { createContext, useContext, type ReactNode } from "react";
import { FaRegTrashAlt } from "react-icons/fa";

import { NODE_TYPE_LABELS, type GenericNode } from "../../nodes";
import { useEditorDispatch } from "../editor-store/EditorDispatchContext";

type NodeInspectorContextValue = {
  inspectedNodeId: string | null;
  inspectNode: (nodeId: string) => void;
};

const NodeInspectorContext = createContext<NodeInspectorContextValue>({
  inspectedNodeId: null,
  inspectNode: () => undefined,
});

export function NodeInspectorProvider({
  inspectedNodeId,
  inspectNode,
  children,
}: {
  inspectedNodeId: string | null;
  inspectNode: (nodeId: string) => void;
  children: ReactNode;
}) {
  return (
    <NodeInspectorContext.Provider value={{ inspectedNodeId, inspectNode }}>
      {children}
    </NodeInspectorContext.Provider>
  );
}

export function NodeCardFrame({
  nodeId,
  nodeType,
  selected,
  children,
}: {
  nodeId: string;
  nodeType: GenericNode["type"];
  selected: boolean;
  children: ReactNode;
}) {
  const { inspectedNodeId, inspectNode } = useContext(NodeInspectorContext);
  const dispatch = useEditorDispatch();
  const selectedClassName = selected ? " creator-card--selected" : "";
  const inspectedClassName =
    inspectedNodeId === nodeId ? " creator-card--inspected" : "";

  return (
    <div
      className={`creator-card${selectedClassName}${inspectedClassName}`}
      onClick={() => {
        if (nodeType === "start") return;
        inspectNode(nodeId);
      }}
    >
      <div className="flex column justify-between w-full">
        <p className="creator-card-kicker">{NODE_TYPE_LABELS[nodeType]}</p>
        {nodeType !== "start" &&
          <FaRegTrashAlt
            color="red"
            className="cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              dispatch({ type: "deleteNodes", ids: [nodeId] });
            }}
          />
        }
      </div>
      {children}
    </div>
  );
}
