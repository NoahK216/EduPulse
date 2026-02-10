import type {GenericNode} from '../nodes';
import type {Scenario} from '../scenarioSchemas';
import type {XYPosition} from '@xyflow/react';

export type EditorState =|{
  status: 'idle';
}
|{
  status: 'loaded';
  doc: Scenario;
  ui: {selectedNodeId: string|null;};
}

type NodePatch = {
  [K in GenericNode['type']]:
      Partial<Omit<Extract<GenericNode, {type: K}>, 'id'|'type'>>;
};

export type EditorAction =|{
  type: 'initScenario';
  scenario: Scenario
}
|{
  type: 'selectNode';
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
};

export function editorReducer(
    state: EditorState, action: EditorAction): EditorState {
  console.log(action)

  switch (action.type) {
    case 'initScenario': {
      return {
        status: 'loaded',
        doc: action.scenario,
        ui: {selectedNodeId: null}
      };
    }

    case 'selectNode':
      if (state.status !== 'loaded') return state;
      return {
        ...state,
        ui: {...state.ui, selectedNodeId: action.id},
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

      return {
        ...state,
        doc: {
          ...state.doc,
          nodes: {
            ...state.doc.nodes,
            [action.id]: {...node, ...action.patch},
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
          selectedNodeId:
              state.ui.selectedNodeId !== null &&
                  deletedIds.has(state.ui.selectedNodeId) ?
                null :
                state.ui.selectedNodeId,
        },
      };
    }
  }
}
