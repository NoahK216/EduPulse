import type { VideoNode } from "../../nodeSchemas";
import type { NodeTabProps } from "./TabRenderer";

// TODO shared components that dispatch for simple fields

export function VideoTab({ node, dispatch }: NodeTabProps<VideoNode>) {
  return (
    <>
      <p>{node.title}</p>
      <input></input>
    </>
  );
}
