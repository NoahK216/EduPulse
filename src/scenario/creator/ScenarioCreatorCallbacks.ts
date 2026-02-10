import type {EdgeChange, NodeChange, XYPosition} from '@xyflow/react';
import type {EditorAction} from './EditorStore';

export const dispatchOnNodesChange =
    (dispatch: React.ActionDispatch<[action: EditorAction]>,
     changes: NodeChange[]) => {
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

// TODO
export const dispatchOnEdgesChange =
    (dispatch: React.ActionDispatch<[action: EditorAction]>,
     changes: EdgeChange[]) => {

    }
