import type { ChoiceNode } from "../../nodeSchemas";
import type { NodeTabProps } from "./TabRenderer";

export function ChoiceTab({ node, dispatch }: NodeTabProps<ChoiceNode>) {
  return (
    <>
      <p>{node.title}</p>
    </>
  );
}

