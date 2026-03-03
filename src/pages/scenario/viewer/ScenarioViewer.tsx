import { useEffect, useState } from "react";
import { SceneRenderer } from "./scenes/SceneRenderer";
import { useSearchParams } from "react-router";
import type { Scenario } from "../scenarioSchemas";
import "./Scenario.css";
import type { GenericNode } from "../nodes";
import type { ScenarioEvent } from "./viewer";

const ScenarioViewer = ({ scenario }: { scenario?: Scenario }) => {
  const [searchParams] = useSearchParams();
  const [loadedScenario, setLoadedScenario] = useState<Scenario | undefined>(
    scenario,
  );
  const [currentNode, setCurrentNode] = useState<GenericNode | undefined>();
  const [scenarioState, setScenarioState] = useState<
    "loading" | "doing" | "finished" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initializeScenario = (s: Scenario) => {
    setLoadedScenario(s);
    setCurrentNode(s.nodes[s.startNodeId]);
  };
  // useEffect(() => { initializeScenario(scenario) }, [scenario])

  useEffect(() => {
    const urlParam = searchParams.get("url");

    if (urlParam) {
      fetch(urlParam)
        .then((res) => res.json())
        .then((data: Scenario) => {
          initializeScenario(data);
          setScenarioState("doing");
        })
        .catch(() => {
          setErrorMessage("Failed to load scenario.");
          setScenarioState("error");
        });
      return;
    }

    if (scenario === undefined) {
      setScenarioState("loading");
    } else {
      setLoadedScenario(scenario);
      initializeScenario(scenario);
      setScenarioState("doing");
    }
  }, [scenario, searchParams]);

  const dispatcher = async (e: ScenarioEvent) => {
    console.log(e);
    switch (e.type) {
      case "NEXT_NODE":
        if (e.nextId) setCurrentNode(loadedScenario!.nodes[e.nextId]);
        else {
          setScenarioState("finished");
          console.log("Scenario over");
        }
        break;
    }
  };

  switch (scenarioState) {
    case "loading":
      return <p>Loading scenario...</p>;
    case "doing":
      return (
        <SceneRenderer
          node={currentNode!}
          edges={loadedScenario!.edges}
          dispatch={dispatcher}
        />
      );
    case "finished":
      return <h1>Scenario complete!</h1>;
    case "error":
      return <p style={{ color: "red" }}>{errorMessage}</p>;
  }
};

export default ScenarioViewer;
