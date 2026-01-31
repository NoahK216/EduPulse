import { useEffect, useState } from "react";
import { NodeRenderer } from "./NodeRenderer";
import type { FreeResponseNode } from "./scenarioNodeSchemas";
import type { Scenario, ScenarioEvent, ScenarioState } from "./scenarioTypes";
import { loadScenario } from "./loadScenario";

function ScenarioDemo() {
  const [currentNodeId, setCurrentNodeId] = useState<string>("");
  const [scenario, setScenario] = useState<Scenario | undefined>(undefined);
  const [grade, setGrade] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
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
    vars: {
      grade,
      gradeError,
      grading,
    },
  };

  const dispatcher = async (e: ScenarioEvent) => {
    switch (e.type) {
      case "NEXT_NODE":
        if (e.nextId) setCurrentNodeId(e.nextId);
        break;
      case "VIDEO_ENDED":
        break;
      case "SUBMIT_FREE_RESPONSE": {
        const node = currentNode() as FreeResponseNode | undefined;
        if (!node) break;
        await gradeFreeResponse(node, e.text);
        break;
      }
    }
  };

  const gradeFreeResponse = async (node: FreeResponseNode, userText: string) => {
    setGrading(true);
    setGrade(null);
    setGradeError(null);

    const rubric = node.rubric;

    try {
      const res = await fetch("/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_prompt: node.prompt,
          user_response_text: userText,
          rubric,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text}`);
      }

      const json = (await res.json()) as { bucket_id: string; feedback: string };
      setGrade(`${json.bucket_id}\n${json.feedback}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setGradeError(message);
    } finally {
      setGrading(false);
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
