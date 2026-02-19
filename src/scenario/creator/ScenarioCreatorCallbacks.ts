import {addEdge, type Connection, type Edge, type EdgeChange, type NodeChange, type XYPosition} from '@xyflow/react';
import type {NodeEdge} from '../scenarioSchemas';
import type {EditorDispatch} from './EditorStore';

const reactFlowEdgeOutgoingHandleKey = (edge: Pick<Edge, 'source'|'sourceHandle'>) =>
  `${edge.source}::${edge.sourceHandle ?? ''}`;

export function enforceSingleOutgoingConnectionPerHandle(edges: Edge[]): Edge[] {
  const seenOutgoingHandles = new Set<string>();
  const deduplicatedEdges: Edge[] = [];

  // Iterate backwards so the most recently changed edge wins.
  for (let i = edges.length - 1; i >= 0; i--) {
    const edge = edges[i];
    const outgoingHandleKey = reactFlowEdgeOutgoingHandleKey(edge);
    if (seenOutgoingHandles.has(outgoingHandleKey)) continue;

    seenOutgoingHandles.add(outgoingHandleKey);
    deduplicatedEdges.push(edge);
  }

  deduplicatedEdges.reverse();
  return deduplicatedEdges;
}

export function createEdgeFromConnection(connection: Connection): Edge|null {
  if (!connection.source || !connection.target) return null;
  const [createdEdge] = enforceSingleOutgoingConnectionPerHandle(
      addEdge(connection, []));
  return createdEdge ?? null;
}

export function toScenarioEdge(edge: Pick<Edge, 'id'|'source'|'sourceHandle'|'target'>):
    NodeEdge {
  return {
    id: edge.id,
    from: {
      nodeId: edge.source,
      ...(edge.sourceHandle ? {port: edge.sourceHandle} : {}),
    },
    to: edge.target ? {nodeId: edge.target} : undefined,
  };
}

export const dispatchOnNodesChange =
    (dispatch: EditorDispatch, changes: NodeChange[]) => {
      // Aggregate
      const positions: Record<string, XYPosition> = {};
      const removedIds: string[] = [];

      for (const ch of changes) {
        // NodePositionChange: { type: "position", id, position, dragging }
        if (ch.type === 'position') {
          // commit only when drag finished
          if (ch.dragging === false && ch.position) {
            positions[ch.id] = ch.position;
          }
        }

        // NodeRemoveChange: { type: "remove", id }
        if (ch.type === 'remove') {
          removedIds.push(ch.id);
        }
      }

      // Dispatch minimal canonical updates
      if (Object.keys(positions).length > 0) {
        dispatch({type: 'setNodePositions', positions});
      }
      if (removedIds.length > 0) {
        dispatch({type: 'deleteNodes', ids: removedIds});
      }
    }

export const dispatchOnEdgesChange =
    (dispatch: EditorDispatch, changes: EdgeChange[]) => {
      for (const change of changes) {
        if (change.type === 'add') {
          dispatch({type: 'addEdge', edge: toScenarioEdge(change.item)});
        }

        if (change.type === 'remove') {
          dispatch({type: 'deleteEdges', ids: [change.id]});
        }

        if (change.type === 'replace') {
          dispatch({
            type: 'replaceEdge',
            id: change.id,
            edge: toScenarioEdge(change.item),
          });
        }
      }
    }
