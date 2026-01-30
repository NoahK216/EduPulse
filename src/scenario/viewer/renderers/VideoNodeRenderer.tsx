import type { NodeRendererProps } from "../scenarioTypes";
import type { VideoNode } from "../scenarioNodeSchemas";

export function VideoNodeRenderer({ node, dispatch }: NodeRendererProps<VideoNode>) {
  return (
    <section>
      <h2>{node.title}</h2>

      {/* TODO Add a dispatch for video ending */}
      <video width="360" height="240" controls preload="auto">
        <source src={node.src} />
        <track src={node.captionsSrc} kind="subtitles" srcLang="en" label="English" />
        Your browser does not support the video tag.
      </video>

    </section>
  );
}
