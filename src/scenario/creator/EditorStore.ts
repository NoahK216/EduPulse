import type {GenericNode} from '../nodes';
import type {NodeEdge, Scenario} from '../scenarioSchemas';
import type {XYPosition} from '@xyflow/react';

export type EditorState =|{
  status: 'idle';
}
|{
  status: 'loaded';
  doc: Scenario;
  // TODO Add multiple node selection
  ui: {inspectedNodeId: string|null;};
}

type NodePatch = {
  [K in GenericNode['type']]: {type: K;}&
  Partial<Omit<Extract<GenericNode, {type: K}>, 'id'|'type'>>;
}[GenericNode['type']];

export type EditorAction =|{
  type: 'initScenario';
  scenario: Scenario
}
|{
  type: 'inspectNode';
  id: string|null
}
|{
  type: 'setNodePositions';
  positions: Record<string, XYPosition>;
}
|{
  type: 'updateNode';
  id: string;
  patch: NodePatch
}
|{
  type: 'addNode';
  node: GenericNode
}
|{
  type: 'deleteNodes';
  ids: string[]
}
|{
  type: 'addEdge';
  edge: NodeEdge;
}
|{
  type: 'deleteEdges';
  ids: string[]
}
|{
  type: 'replaceEdge';
  id: string;
  edge: NodeEdge;
};

const edgeConnectionMatches = (a: NodeEdge, b: NodeEdge) =>
  a.from.nodeId === b.from.nodeId &&
  a.from.port === b.from.port &&
  a.to?.nodeId === b.to?.nodeId;

const edgeOutgoingHandleMatches = (a: NodeEdge, b: NodeEdge) =>
  a.from.nodeId === b.from.nodeId &&
  a.from.port === b.from.port;

export function editorReducer(
    state: EditorState, action: EditorAction): EditorState {
  console.log(action)

  switch (action.type) {
    case 'initScenario': {
      return {
        status: 'loaded',
        doc: action.scenario,
        ui: {inspectedNodeId: null}
      };
    }

    case 'inspectNode':
      if (state.status !== 'loaded') return state;
      return {
        ...state,
        ui: {...state.ui, inspectedNodeId: action.id},
      };


    case 'setNodePositions': {
      if (state.status !== 'loaded') return state;

      const nextLayout = {...state.doc.layout};
      for (const [id, pos] of Object.entries(action.positions)) {
        nextLayout[id] = {
          ...nextLayout[id],
          x: pos.x,
          y: pos.y,
        };
      }

      return {
        ...state,
        doc: {
          ...state.doc,
          layout: nextLayout,
        },
      };
    }

    case 'updateNode': {
      if (state.status !== 'loaded') return state;
      const node = state.doc.nodes[action.id];
      if (!node) return state;
      if (action.patch.type !== node.type) return state;
      const {type: _, ...patch} = action.patch;

      return {
        ...state,
        doc: {
          ...state.doc,
          nodes: {
            ...state.doc.nodes,
            [action.id]: {...node, ...patch},
          },
        },
      };
    }

    case 'addNode':
      if (state.status !== 'loaded') return state;
      return {
        ...state,
        doc: {
          ...state.doc,
          nodes: {
            ...state.doc.nodes,
            [action.node.id]: action.node,
          },
        },
      };

    case 'deleteNodes': {
      if (state.status !== 'loaded') return state;

      const nodes = {...state.doc.nodes};
      const layout = {...state.doc.layout};
      const deletedIds = new Set(action.ids);
      for (const id of deletedIds) {
        delete nodes[id];
        delete layout[id];
      }
      const edges = state.doc.edges.filter((edge) => {
        if (deletedIds.has(edge.from.nodeId)) return false;
        const toNodeId = edge.to?.nodeId;
        return !toNodeId || !deletedIds.has(toNodeId);
      });

      return {
        ...state,
        doc: {...state.doc, nodes, edges, layout},
        ui: {
          ...state.ui,
          inspectedNodeId: state.ui.inspectedNodeId !== null &&
                  deletedIds.has(state.ui.inspectedNodeId) ?
              null :
              state.ui.inspectedNodeId,
        }
      };
    }

    case 'addEdge': {
      if (state.status !== 'loaded') return state;
      if (!state.doc.nodes[action.edge.from.nodeId]) return state;
      if (action.edge.to?.nodeId && !state.doc.nodes[action.edge.to.nodeId]) {
        return state;
      }

      const exactMatch = state.doc.edges.find((edge) =>
        edge.id === action.edge.id &&
        edgeConnectionMatches(edge, action.edge));
      const conflictingEdges = state.doc.edges.filter((edge) =>
        edge.id === action.edge.id ||
        edgeOutgoingHandleMatches(edge, action.edge));

      if (exactMatch && conflictingEdges.length === 1) {
        return state;
      }

      const nextEdges = state.doc.edges.filter((edge) =>
        edge.id !== action.edge.id &&
        !edgeOutgoingHandleMatches(edge, action.edge));

      return {
        ...state,
        doc: {
          ...state.doc,
          edges: [...nextEdges, action.edge],
        },
      };
    }

    case 'deleteEdges': {
      if (state.status !== 'loaded') return state;
      const edgeIdsToDelete = new Set(action.ids);
      const nextEdges =
          state.doc.edges.filter((edge) => !edgeIdsToDelete.has(edge.id));
      if (nextEdges.length === state.doc.edges.length) return state;

      return {
        ...state,
        doc: {
          ...state.doc,
          edges: nextEdges,
        },
      };
    }

    case 'replaceEdge': {
      if (state.status !== 'loaded') return state;
      if (!state.doc.nodes[action.edge.from.nodeId]) return state;
      if (action.edge.to?.nodeId && !state.doc.nodes[action.edge.to.nodeId]) {
        return state;
      }
      const edgeToReplace = state.doc.edges.find((edge) => edge.id === action.id);
      if (!edgeToReplace) return state;

      const exactMatch = edgeToReplace.id === action.edge.id &&
          edgeConnectionMatches(edgeToReplace, action.edge);
      const hasConflictingEdge = state.doc.edges.some((edge) =>
        edge.id !== action.id &&
        (edge.id === action.edge.id ||
        edgeOutgoingHandleMatches(edge, action.edge)));

      if (exactMatch && !hasConflictingEdge) {
        return state;
      }

      const nextEdges = state.doc.edges.filter((edge) =>
        edge.id !== action.id &&
        edge.id !== action.edge.id &&
        !edgeOutgoingHandleMatches(edge, action.edge));
      nextEdges.push(action.edge);

      return {
        ...state,
        doc: {
          ...state.doc,
          edges: nextEdges,
        },
      };
    }
  }
}

export type EditorDispatch = React.ActionDispatch<[action: EditorAction]>;
