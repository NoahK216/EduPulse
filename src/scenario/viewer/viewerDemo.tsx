import { useEffect, useState } from "react";
import ScenarioViewer from "./ScenarioViewer";
import { loadEditorScenario } from "../creator/EditorScenarioSchemas";
import type { Scenario } from "../scenarioSchemas";
import { ScenarioImportButton } from "../creator/ui/ScenarioImportButton";

function ScenarioViewerDemo() {
  const [scenario, setScenario] = useState<Scenario>();
  const [error, setError] = useState<string>();

  const scenarioUrl = "/scenarios/creator.json"

  useEffect(() => {
    loadEditorScenario(scenarioUrl)
      .then((parsed) => {
        setScenario(parsed.scenario);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load scenario";
        setError(message);
      })
  }, [scenarioUrl]);

  return (

    <div className="view-demo flex h-screen w-screen justify-center items-center">
      <div className="fixed top-1 flex flex-col text-center">
        <ScenarioImportButton onLoaded={(s) => setScenario(s.scenario)} />
        {error}
      </div>

      <ScenarioViewer scenario={scenario} />
    </div>

  );
}

export default ScenarioViewerDemo;
