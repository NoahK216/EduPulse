import type { NodeRendererProps } from "../scenarioTypes";
import type { VideoNode } from "../scenarioNodeSchemas";
import { useEffect, useRef } from "react";

export function VideoNodeRenderer({ node, dispatch }: NodeRendererProps<VideoNode>) {
  const playerRef = useRef<HTMLVideoElement>(null);

  // TODO eventually use a video player without scrub forward.

  useEffect(() => {
    const v = playerRef.current;
    if (!v) return;

    v.onended = () => { dispatch({ type: "NEXT_NODE", nextId: node.toNode }) }
  }, [dispatch, node.id]);


  return (
    <section>
      <h2>{node.title}</h2>

      <video ref={playerRef} width="360" height="240" controls disablePictureInPicture preload="auto">
        <source src={node.src} />
        <track src={node.captionsSrc} kind="subtitles" srcLang="en" label="English" />
        Your browser does not support the video tag.
      </video>

    </section>
  );
}
