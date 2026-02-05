import { useEffect, useState } from "react";
import { NodeRenderer } from "./NodeRenderer";
import type { Scenario, ScenarioEvent, ScenarioVars } from "../scenarioTypes";
import type { ScenarioNode } from "../scenarioNodeSchemas";
import "./Scenario.css";
import { loadEditorScenario } from "../creator/EditorScenarioSchemas";

const ScenarioViewer = ({ scenarioUrl }: { scenarioUrl: string }) => {
    const [scenario, setScenario] = useState<Scenario | undefined>();
    const [currentNode, setCurrentNode] = useState<ScenarioNode | undefined>();
    const [scenarioState, setScenarioState] = useState<'loading' | 'doing' | 'finished' | 'error'>('loading')
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const nodeOfId = (s: Scenario, id: string) => s.nodes.find((node) => node.id === id);

    const initializeScenario = (s: Scenario) => {
        setScenario(s);
        setCurrentNode(nodeOfId(s, s.startNodeId));
        console.log(s);
    };

    useEffect(() => {
        loadEditorScenario(scenarioUrl)
            .then((parsed) => {
                initializeScenario(parsed.scenario);
            })
            .catch((error) => {
                const message = error instanceof Error ? error.message : "Failed to load scenario";
                setErrorMessage(message);
                setScenarioState('error');
            })
            .finally(() => setScenarioState('doing'));
    }, [scenarioUrl]);

    const dispatcher = async (e: ScenarioEvent) => {
        console.log(e);
        switch (e.type) {
            case "NEXT_NODE":
                if (e.nextId) setCurrentNode(nodeOfId(scenario!, e.nextId));
                else {
                    setScenarioState('finished');
                    console.log("Scenario over");
                }
                break;
        }
    };

    // TODO Passing raw mutable vars is rarely a good idea in React
    const scenarioVars: ScenarioVars = {}

    switch (scenarioState) {
        case 'loading':
            return <p>Loading scenario...</p>;
        case 'doing':
            return <NodeRenderer node={currentNode!} edges={scenario!.edges} vars={scenarioVars} dispatch={dispatcher} />;
        case 'finished':
            return <h1>Scenario complete!</h1>;
        case 'error':
            return <p style={{ color: "red" }}>{errorMessage}</p>;
    }

}

export default ScenarioViewer;
