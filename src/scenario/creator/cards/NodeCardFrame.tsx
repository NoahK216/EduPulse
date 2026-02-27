import { createContext, useContext, type ReactNode } from "react";

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
  selected,
  children,
}: {
  nodeId: string;
  selected: boolean;
  children: ReactNode;
}) {
  const { inspectedNodeId, inspectNode } = useContext(NodeInspectorContext);
  const selectedClassName = selected ? " creator-card--selected" : "";
  const inspectedClassName =
    inspectedNodeId === nodeId ? " creator-card--inspected" : "";

  return (
    <div
      className={`creator-card${selectedClassName}${inspectedClassName}`}
      onClick={() => inspectNode(nodeId)}
    >
      {children}
    </div>
  );
}
