import type { NodeSceneProps } from "../viewerTypes";
import type { VideoNode } from "../../nodeSchemas";
import { useEffect, useRef } from "react";

export function VideoScene({ node, busy, errorMessage, dispatch }: NodeSceneProps<VideoNode>) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const didAutoAdvanceRef = useRef<boolean>(null);

  // TODO eventually use a video player without scrub forward.
  useEffect(() => {
    if (!node.src && !busy && !didAutoAdvanceRef.current) {
      didAutoAdvanceRef.current = true;
      dispatch({ type: "ADVANCE" });
    }
    const v = playerRef.current;
    if (!v) return;
    v.onended = () => dispatch({ type: "ADVANCE" });
  }, [node.id, node.src, busy, dispatch]);

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

        {errorMessage ? <p>{errorMessage}</p> : null}
      </div>
    </section>
  );
}
