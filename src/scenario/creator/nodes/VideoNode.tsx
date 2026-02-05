import type { VideoNode } from "../../scenarioNodeSchemas";
import { useState } from "react";
import {
  Handle,
  Position,
  type Node,
  type NodeProps
} from '@xyflow/react';

// type: z.literal('video'),
// src: z.string(),
// captionsSrc: z.string().optional(),
// autoplay: z.boolean().optional(),
// toNode: z.string().optional(),

export type VideoNodeFlow = Node<
  {
    initialNode: VideoNode
  }
>;

// TODO We'll want a full screen node editor modal

export function VideoNode(props: NodeProps<VideoNodeFlow>) {
  const [nodeData, setNodeData] = useState<VideoNode>(props.data.initialNode);

  return (
    <div className="custom-node">
      <p>{nodeData.title}</p>

      {/* TODO Eventually store video uploads */}

      <video
        // ref={playerRef}
        width="165"
        height="120"
        controls
        disablePictureInPicture
        preload="auto"
      >
        <source src={nodeData.src} />
        <track src={nodeData.captionsSrc} kind="subtitles" srcLang="en" label="English" />
        Your browser does not support the video tag.
      </video>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
