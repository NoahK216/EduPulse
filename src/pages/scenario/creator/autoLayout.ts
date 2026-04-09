import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 240;
const NODE_HEIGHT = 130;
const RANK_SEP = 160; // horizontal gap between columns
const NODE_SEP = 80;  // vertical gap between nodes in the same column

/**
 * Runs a left-to-right Dagre layout over the given ReactFlow nodes/edges.
 * Disconnected nodes are arranged in a horizontal row at the top.
 * Returns a new nodes array with updated positions.
 */
export function applyAutoLayout(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', ranksep: RANK_SEP, nodesep: NODE_SEP });

  for (const node of nodes) {
    g.setNode(node.id, {
      width: node.measured?.width ?? node.width ?? NODE_WIDTH,
      height: node.measured?.height ?? node.height ?? NODE_HEIGHT,
    });
  }

  // Only add edges between nodes that exist
  for (const edge of edges) {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  // If no edges at all, force a dummy chain so Dagre ranks them LR
  const connectedNodeIds = new Set(edges.flatMap(e => [e.source, e.target]));
  const disconnected = nodes.filter(n => !connectedNodeIds.has(n.id));

  if (edges.length === 0) {
    // All nodes disconnected — arrange manually in a horizontal row
    return nodes.map((node, i) => ({
      ...node,
      position: {
        x: i * (NODE_WIDTH + RANK_SEP),
        y: 0,
      },
    }));
  }

  dagre.layout(g);

  // Place disconnected nodes in a row above the graph
  const laidOut = nodes.map((node) => {
    if (!connectedNodeIds.has(node.id)) return node; // handle below
    const dagreNode = g.node(node.id);
    const w = dagreNode.width;
    const h = dagreNode.height;
    return {
      ...node,
      position: {
        x: dagreNode.x - w / 2,
        y: dagreNode.y - h / 2,
      },
    };
  });

  // Row disconnected nodes above the main graph
  disconnected.forEach((node, i) => {
    const idx = laidOut.findIndex(n => n.id === node.id);
    if (idx === -1) return;
    laidOut[idx] = {
      ...laidOut[idx],
      position: {
        x: i * (NODE_WIDTH + RANK_SEP),
        y: -(NODE_HEIGHT + NODE_SEP),
      },
    };
  });

  return laidOut;
}
