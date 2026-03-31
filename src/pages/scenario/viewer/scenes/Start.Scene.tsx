import { useEffect, useRef } from "react";
import type { StartNode } from "../../nodeSchemas";
import type { NodeSceneProps } from "../viewerTypes";

export function StartScene({ node, dispatch }: NodeSceneProps<StartNode>) {
  const dispatchedAdvanceRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!dispatchedAdvanceRef.current) {
      dispatchedAdvanceRef.current = true;
      void dispatch({ type: "ADVANCE" });
    }

  }, [dispatch, node.id]);

  return null;
}
