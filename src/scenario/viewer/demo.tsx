import { useEffect, useState } from "react";
import { NodeRenderer } from "./NodeRenderer";
import type { Scenario, ScenarioEvent, ScenarioState } from "./scenarioTypes";
import { loadScenario } from "./loadScenario";

function ScenarioDemo() {
  const [currentNodeId, setCurrentNodeId] = useState<string>("");
  const [scenario, setScenario] = useState<Scenario | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const currentNode = () => scenario?.nodes.find((node) => node.id === currentNodeId);

  const initializeScenario = (s: Scenario) => {
    setScenario(s);
    setCurrentNodeId(s.startNodeId);
  };

  useEffect(() => {
    loadScenario("/scenarios/demo.json")
      .then((parsed) => {
        initializeScenario(parsed);
        setLoadError(null);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load scenario";
        setLoadError(message);
        setScenario(undefined);
      })
      .finally(() => setLoading(false));
  }, []);

  const scenarioState: ScenarioState = {
    currentNodeId,
    vars: {}
  };

  const dispatcher = async (e: ScenarioEvent) => {
    console.log(e);
    switch (e.type) {
      case "NEXT_NODE":
        if (e.nextId) setCurrentNodeId(e.nextId);
        else { console.log("Scenario over"); }
        break;
    }
  };

  return (
    <>
      {loading && <p>Loading scenario...</p>}
      {loadError && <p style={{ color: "red" }}>{loadError}</p>}
      {currentNode() && (
        <NodeRenderer node={currentNode()!} state={scenarioState} dispatch={dispatcher} />
      )}
    </>
  );
}

export default ScenarioDemo;
