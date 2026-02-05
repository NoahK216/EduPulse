import type { NodeRendererProps } from "../../scenarioTypes";
import type { VideoNode } from "../../scenarioNodeSchemas";
import { useEffect, useRef } from "react";
import { nextNodeId } from "../findEdge";

export function VideoNodeRenderer({ node, edges, dispatch }: NodeRendererProps<VideoNode>) {
  const playerRef = useRef<HTMLVideoElement>(null);

  // TODO eventually use a video player without scrub forward.
  useEffect(() => {
    const v = playerRef.current;
    if (!v) return;
    v.onended = () => dispatch({ type: "NEXT_NODE", nextId: nextNodeId(node, edges) });
  }, [node, edges, dispatch]);

  return (
    <section>
      <h2>{node.title}</h2>

      <video
        ref={playerRef}
        width="360"
        height="240"
        controls
        disablePictureInPicture
        preload="auto"
      >
        <source src={node.src} />
        <track src={node.captionsSrc} kind="subtitles" srcLang="en" label="English" />
        Your browser does not support the video tag.
      </video>
    </section>
  );
}
