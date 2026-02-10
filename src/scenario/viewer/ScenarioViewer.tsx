import { useEffect, useState } from "react";
import { SceneRenderer } from "./SceneRenderer";
import type { Scenario } from "../scenarioSchemas";
import "./Scenario.css";
import type { GenericNode } from "../nodes";
import type { ScenarioEvent } from "./viewer";

const ScenarioViewer = ({ scenario }: { scenario?: Scenario }) => {
    const [currentNode, setCurrentNode] = useState<GenericNode | undefined>();
    const [scenarioState, setScenarioState] = useState<'loading' | 'doing' | 'finished' | 'error'>('loading')
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const initializeScenario = (s: Scenario) => {
        setCurrentNode(s.nodes[s.startNodeId]);
        console.log(s);
    };

    // useEffect(() => { initializeScenario(scenario) }, [scenario])

    useEffect(() => {
        if (scenario === undefined) {
            setScenarioState('loading');
        } else {
            initializeScenario(scenario);
            setScenarioState('doing');
        }
    }, [scenario]);

    const dispatcher = async (e: ScenarioEvent) => {
        console.log(e);
        switch (e.type) {
            case "NEXT_NODE":
                if (e.nextId) setCurrentNode(scenario!.nodes[e.nextId]);
                else {
                    setScenarioState('finished');
                    console.log("Scenario over");
                }
                break;
        }
    };

    switch (scenarioState) {
        case 'loading':
            return <p>Loading scenario...</p>;
        case 'doing':
            return <SceneRenderer node={currentNode!} edges={scenario!.edges} dispatch={dispatcher} />;
        case 'finished':
            return <h1>Scenario complete!</h1>;
        case 'error':
            return <p style={{ color: "red" }}>{errorMessage}</p>;
    }

}

export default ScenarioViewer;
