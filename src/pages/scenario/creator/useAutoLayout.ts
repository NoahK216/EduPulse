/**
 * useAutoLayout — Dagre-based automatic node layout for the scenario editor.
 *
 * Returns a `runLayout` function that:
 *  1. Reads the current React Flow nodes & edges (including their measured sizes).
 *  2. Runs them through Dagre in top-to-bottom order.
 *  3. Dispatches `setNodePositions` so the Scenario doc stays in sync.
 *  4. Calls `fitView` so the result is immediately visible.
 */

import { useCallback } from "react";
import dagre from "@dagrejs/dagre";
import type { ReactFlowInstance } from "@xyflow/react";
import type { EditorAction } from "./editor-store/EditorStore";

// Default node dimensions used when React Flow hasn't measured a node yet.
const DEFAULT_NODE_WIDTH = 280;
const DEFAULT_NODE_HEIGHT = 120;

// Dagre graph-level spacing options.
const DAGRE_RANKSEP = 80;   // vertical gap between ranks
const DAGRE_NODESEP = 48;   // horizontal gap between nodes in the same rank
const DAGRE_EDGESEP = 20;

export function useAutoLayout(
  reactFlowInstance: ReactFlowInstance | undefined,
  dispatch: React.Dispatch<EditorAction>,
) {
  const runLayout = useCallback(() => {
    if (!reactFlowInstance) return;

    const rfNodes = reactFlowInstance.getNodes();
    const rfEdges = reactFlowInstance.getEdges();

    if (rfNodes.length === 0) return;

    // ── Build dagre graph ─────────────────────────────────────────
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: "TB",          // top → bottom
      ranksep: DAGRE_RANKSEP,
      nodesep: DAGRE_NODESEP,
      edgesep: DAGRE_EDGESEP,
    });

    for (const node of rfNodes) {
      g.setNode(node.id, {
        width: node.measured?.width ?? node.width ?? DEFAULT_NODE_WIDTH,
        height: node.measured?.height ?? node.height ?? DEFAULT_NODE_HEIGHT,
      });
    }

    for (const edge of rfEdges) {
      g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    // ── Extract positions (dagre centres nodes; RF uses top-left) ─
    const positions: Record<string, { x: number; y: number }> = {};

    for (const node of rfNodes) {
      const dagreNode = g.node(node.id);
      if (!dagreNode) continue;

      const w = node.measured?.width ?? node.width ?? DEFAULT_NODE_WIDTH;
      const h = node.measured?.height ?? node.height ?? DEFAULT_NODE_HEIGHT;

      positions[node.id] = {
        x: dagreNode.x - w / 2,
        y: dagreNode.y - h / 2,
      };
    }

    // ── Push new positions into the editor document ───────────────
    dispatch({ type: "setNodePositions", positions });

    // ── Fit view after the next paint so nodes have moved ─────────
    requestAnimationFrame(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
    });
  }, [reactFlowInstance, dispatch]);

  return { runLayout };
}
