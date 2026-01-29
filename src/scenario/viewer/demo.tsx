import { useState } from "react";
import { NodeRenderer } from "./NodeRenderer";
import type { VideoNode, FreeResponseNode, ChoiceNode, ScenarioNode } from "./nodeTypes";
import type { ScenarioState } from "./scenarioTypes";

function ScenarioDemo() {
    const [nodeIndex, setNodeIndex] = useState<number>(0);

    const videNode: VideoNode = {
        type: "video",
        id: "id",
        title: "Video",
        src: "depression.mp4"
        // captionsSrc: string;
    }

    const responseNode: FreeResponseNode = {
        type: "free_response",
        id: "id",
        title: "Free Response",
        prompt: "What should you do?",
    }

    const choiceNode: ChoiceNode = {
        type: "choice",
        id: "id",
        title: "Multiple Choice",
        prompt: "What should you do?",
        choices: [
            { id: "c1", label: "Do a good thing" },
            { id: "c2", label: "Do a bad thing" },
            { id: "c3", label: "Do something in between" },
        ]
    }

    const nodeList: ScenarioNode[] = [videNode, responseNode, choiceNode];

    const scenarioState: ScenarioState = {
        currentNodeId: "string",
        vars: {},
    }

    return <>
        <button onClick={() => setNodeIndex(nodeIndex + 1)} >
            Next node
        </button>

        <NodeRenderer node={nodeList[nodeIndex % 3]} state={scenarioState} dispatch={(e) => console.log(e)} />
    </>
}

export default ScenarioDemo;