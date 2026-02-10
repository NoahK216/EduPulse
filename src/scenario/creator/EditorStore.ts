import type {GenericNode} from '../nodes';
import type {EditorScenario} from '../scenarioSchemas';

export type EditorStore = {
  doc: EditorScenario, ui: {selectedNodeId: string|null;};
}

type Action =|{
  type: 'selectNode';
  id: string|null
}
|{
  type: 'updateNode';
  id: string;
  patch: Partial<GenericNode>
}

// TODO This should probably eventually handle node creation as well.

function reducer(state: EditorStore, action: Action): EditorStore {
  switch (action.type) {
    case 'selectNode':
      return {...state, ui:{selectedNodeId: action.id}};

    case 'updateNode': {
      const node = state.doc.scenario.nodes[action.id];
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
  }
}
