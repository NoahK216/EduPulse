import type { VideoNode } from "../../nodeSchemas";
import {
  Handle,
  Position,
  type NodeProps
} from '@xyflow/react';
import type { ReactFlowCard } from "./Cards";
import { NodeCardFrame } from "./NodeCardFrame";


export function VideoCard(props: NodeProps<ReactFlowCard<VideoNode>>) {
  const node = props.data.node;

  return (
    <NodeCardFrame nodeId={node.id} selected={Boolean(props.selected)}>
      <Handle type="target" position={Position.Left} className="creator-handle" />
      <p className="creator-card-kicker">Video</p>
      <h2 className="creator-card-title">{node.title?.trim() || "Untitled video"}</h2>
      <p className="creator-card-description">
        {node.src?.trim() || "No source URL configured."}
      </p>

      {node.src ? (
        <video
          className="creator-card-video-preview"
          muted
          playsInline
          controls
          preload="metadata"
        >
          <source src={node.src} />
          {node.captionsSrc && (
            <track
              src={node.captionsSrc}
              kind="subtitles"
              srcLang="en"
              label="English"
            />
          )}
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="creator-card-video-empty">No preview</div>
      )}

      <div className="creator-card-meta">
        <span className="creator-card-tag">{node.autoplay ? "Autoplay" : "Manual Play"}</span>
        <span className="creator-card-tag">{node.captionsSrc ? "Captions" : "No Captions"}</span>
      </div>

      <Handle type="source" position={Position.Right} className="creator-handle" />
    </NodeCardFrame>
  );
}
