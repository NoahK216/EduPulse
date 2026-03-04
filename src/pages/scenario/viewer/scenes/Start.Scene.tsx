import { useEffect } from "react";
import type { StartNode } from "../../nodeSchemas";
import { nextNodeId, type NodeSceneProps } from "../viewer";

export function StartScene({ node, edges, dispatch }: NodeSceneProps<StartNode>) {
  useEffect(() => {
    dispatch({ type: "NEXT_NODE", nextId: nextNodeId(node, edges) });
  }, [dispatch, node, edges]);

  return null;
}
