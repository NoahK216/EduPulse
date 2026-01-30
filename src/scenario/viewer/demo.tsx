import { useEffect, useState } from "react";
import { NodeRenderer } from "./NodeRenderer";
import type { ChoiceNode } from "./scenarioNodeSchemas";
import type { Scenario, ScenarioEvent, ScenarioState } from "./scenarioTypes";
import { loadScenario } from "./loadScenario";

function ScenarioDemo() {
    const [currentNodeId, setCurrentNodeId] = useState<string>("");
    const [scenario, setScenario] = useState<Scenario | undefined>(undefined);


    const currentNode = () => {
        return scenario?.nodes.find(node => node.id === currentNodeId);
    }


    const initializeScenario = (s: Scenario) => {
        setScenario(s);
        setCurrentNodeId(s.startNodeId);

        console.log(s);
        console.log(currentNode());
    }

    useEffect(() => {
        const fetchScenario = async () => {
            try {
                const parsedScenario = await loadScenario("./scenario.json");
                initializeScenario(parsedScenario);
            } catch (error) {
                // TODO error handling
                // setScenario(undefined);
            }
        };

        fetchScenario();
    }, []);

    const scenarioState: ScenarioState = {
        currentNodeId: "string",
        vars: {},
    }

    const dispatcher = (e: ScenarioEvent) => {
        console.log(e)
        // TODO
        switch (e.type) {
            case "VIDEO_ENDED":
                break;
            case "SUBMIT_FREE_RESPONSE":
                // setCurrentNodeId((currentNode() as FreeResponseNode).toNode)
                break;
            case "SELECT_CHOICE":
                setCurrentNodeId((currentNode() as ChoiceNode).choices.find(choice => choice.id === e.choiceId)?.toNode!);
                break;
        }
    }

    return <>
        {currentNode() &&
            <NodeRenderer
                node={currentNode()!}
                state={scenarioState}
                dispatch={dispatcher}
            />
        }
    </>
}

export default ScenarioDemo;