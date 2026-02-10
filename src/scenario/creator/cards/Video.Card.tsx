import type { VideoNode } from "../../nodeSchemas";
import {
  Handle,
  Position,
  type NodeProps
} from '@xyflow/react';
import type { ReactFlowCard } from "./Cards";


export function VideoCard(props: NodeProps<ReactFlowCard<VideoNode>>) {
  const node = props.data.node;

  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Left} />
      <p>{node.title}</p>

      {/* TODO Eventually store video uploads */}

      <video
        // ref={playerRef}
        width="165"
        height="120"
        controls
        disablePictureInPicture
        preload="auto"
      >
        <source src={node.src} />
        <track src={node.captionsSrc} kind="subtitles" srcLang="en" label="English" />
        Your browser does not support the video tag.
      </video>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
