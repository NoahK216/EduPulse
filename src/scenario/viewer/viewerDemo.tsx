import { useEffect, useState } from "react";
import ScenarioViewer from "./ScenarioViewer";
import type { Scenario } from "../scenarioSchemas";
import { ScenarioImportButton } from "../creator/ui/ScenarioImportButton";
import { loadScenario } from "../creator/import";

function ScenarioViewerDemo() {
  const [scenario, setScenario] = useState<Scenario>();
  const [error, setError] = useState<string>();

  const scenarioUrl = "/scenarios/creator.json"

  useEffect(() => {
    loadScenario(scenarioUrl)
      .then((parsed) => {
        setScenario(parsed);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load scenario";
        setError(message);
      })
  }, [scenarioUrl]);

  return (

    <div className="view-demo flex h-screen w-screen justify-center items-center">
      <div className="fixed top-1 flex flex-col text-center">
        <ScenarioImportButton onLoaded={(s) => setScenario(s)} />
        {error}
      </div>

      <ScenarioViewer scenario={scenario} />
    </div>

  );
}

export default ScenarioViewerDemo;
