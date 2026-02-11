import type {GenericNode} from '../nodes';
import type {Scenario} from '../scenarioSchemas';
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
};

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
  }
}

export type EditorDispatch = React.ActionDispatch<[action: EditorAction]>;
