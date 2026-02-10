import { nextNodeId, type NodeSceneProps } from "../viewer";
import type { VideoNode } from "../../nodeSchemas";
import { useEffect, useRef } from "react";

export function VideoScene({ node, edges, dispatch }: NodeSceneProps<VideoNode>) {
  const playerRef = useRef<HTMLVideoElement>(null);

  // TODO eventually use a video player without scrub forward.
  useEffect(() => {
    const v = playerRef.current;
    if (!v) return;
    v.onended = () => dispatch({ type: "NEXT_NODE", nextId: nextNodeId(node, edges) });
  }, [node, edges, dispatch]);

  return (
    <section>
      <div className=" max-w-4xl">
        <h2 className="mb-2 text-2xl font-semibold">{node.title}</h2>

        <video
          ref={playerRef}
          className="rounded-2xl"
          controls
          disablePictureInPicture
          preload="auto">
          <source src={node.src} />
          <track src={node.captionsSrc} kind="subtitles" srcLang="en" label="English" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
}
