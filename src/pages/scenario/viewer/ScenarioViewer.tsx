import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { ApiRequestError, publicApiPost, resolvePublicApiToken } from "../../../lib/public-api-client";
import type { ItemResponse, PublicAttempt, PublicAttemptProgressResult } from "../../../types/publicApi";
import type { FreeResponseNode, GenericNode } from "../nodeSchemas";
import {
  getNextNodeIdForScenarioNode,
  getScenarioNode,
  type Scenario,
} from "../scenarioSchemas";
import { SceneRenderer } from "./scenes/SceneRenderer";
import { evaluateFreeResponse } from "./scenes/FreeResponseGrader";
import type { ScenarioEvent } from "./viewerTypes";

type ScenarioViewerProps = {
  scenario?: Scenario;
  initialNodeId?: string | null;
  attemptId?: string | null;
  onAttemptUpdate?: (attempt: PublicAttempt) => void;
  onFinished?: () => void;
};

type ProgressOutcome = {
  nextNodeId: string | null;
  completed: boolean;
  feedback: string | null;
};

function normalizeNextNodeId(
  scenario: Scenario,
  nextNodeId: string | null | undefined,
) {
  if (!nextNodeId) {
    return null;
  }

  return nextNodeId in scenario.nodes ? nextNodeId : null;
}

function getAttemptProgressBody(event: ScenarioEvent) {
  switch (event.type) {
    case "ADVANCE":
      return { type: "advance" } as const;
    case "SELECT_CHOICE":
      return {
        type: "answer_choice",
        choice_id: event.choiceId,
      } as const;
    case "SUBMIT_FREE_RESPONSE":
      return {
        type: "answer_free_response",
        answer_text: event.answerText,
      } as const;
  }
}

function ScenarioViewer({
  scenario,
  initialNodeId,
  attemptId = null,
  onAttemptUpdate,
  onFinished,
}: ScenarioViewerProps) {
  const [searchParams] = useSearchParams();
  const scenarioUrl = searchParams.get("url");
  const [loadedScenario, setLoadedScenario] = useState<Scenario | undefined>(scenario);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [scenarioState, setScenarioState] = useState<
    "loading" | "doing" | "finished" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingFeedback, setPendingFeedback] = useState<{
    feedback: string;
    nextNodeId: string | null;
    completed: boolean;
  } | null>(null);

  const initializeScenario = (
    nextScenario: Scenario,
    nextNodeId?: string | null,
  ) => {
    setLoadedScenario(nextScenario);
    setCurrentNodeId(nextNodeId ?? nextScenario.startNodeId);
    setScenarioState("doing");
    setErrorMessage(null);
    setActionErrorMessage(null);
    setPendingFeedback(null);
    setBusy(false);
  };

  useEffect(() => {
    if (scenarioUrl) {
      fetch(scenarioUrl)
        .then((res) => res.json())
        .then((data: Scenario) => {
          initializeScenario(data, initialNodeId ?? data.startNodeId);
        })
        .catch(() => {
          setErrorMessage("Failed to load scenario.");
          setScenarioState("error");
        });
      return;
    }

    if (scenario === undefined) {
      setScenarioState("loading");
      setLoadedScenario(undefined);
      setCurrentNodeId(null);
    } else {
      initializeScenario(scenario, initialNodeId ?? scenario.startNodeId);
    }
  }, [initialNodeId, scenario, scenarioUrl]);

  useEffect(() => {
    if (scenarioState === "finished" && onFinished) {
      onFinished();
    }
  }, [onFinished, scenarioState]);

  const currentNode =
    loadedScenario && currentNodeId
      ? getScenarioNode(loadedScenario, currentNodeId)
      : null;

  const applyProgressOutcome = (nextNodeId: string | null, completed: boolean) => {
    if (completed || nextNodeId === null) {
      setCurrentNodeId(null);
      setScenarioState("finished");
      return;
    }

    setCurrentNodeId(nextNodeId);
  };

  const runLocalProgress = async (
    node: GenericNode,
    scenarioDocument: Scenario,
    event: ScenarioEvent,
  ): Promise<ProgressOutcome> => {
    switch (node.type) {
      case "start":
      case "text":
      case "video": {
        if (event.type !== "ADVANCE") {
          throw new Error(`Node ${node.id} only supports advancing.`);
        }

        const nextNodeId = normalizeNextNodeId(
          scenarioDocument,
          getNextNodeIdForScenarioNode(node, scenarioDocument.edges),
        );
        return {
          nextNodeId,
          completed: nextNodeId === null,
          feedback: null,
        };
      }
      case "choice": {
        if (event.type !== "SELECT_CHOICE") {
          throw new Error(`Node ${node.id} requires a choice selection.`);
        }

        if (!node.choices.some((choice) => choice.id === event.choiceId)) {
          throw new Error("Selected choice does not exist on this node.");
        }

        const nextNodeId = normalizeNextNodeId(
          scenarioDocument,
          getNextNodeIdForScenarioNode(node, scenarioDocument.edges, event.choiceId),
        );
        return {
          nextNodeId,
          completed: nextNodeId === null,
          feedback: null,
        };
      }
      case "free_response": {
        if (event.type !== "SUBMIT_FREE_RESPONSE") {
          throw new Error(`Node ${node.id} requires a written response.`);
        }

        const result = await evaluateFreeResponse(
          node as FreeResponseNode,
          event.answerText,
        );
        if (!result.ok) {
          throw new Error(result.error);
        }

        const nextNodeId = normalizeNextNodeId(
          scenarioDocument,
          getNextNodeIdForScenarioNode(
            node,
            scenarioDocument.edges,
            result.evaluation.bucket_id,
          ),
        );
        return {
          nextNodeId,
          completed: nextNodeId === null,
          feedback: result.evaluation.feedback?.trim() || null,
        };
      }
    }
  };

  const runAttemptProgress = async (
    event: ScenarioEvent,
  ): Promise<ProgressOutcome> => {
    if (!attemptId) {
      throw new Error("Attempt progress requested without an attempt id.");
    }

    const token = await resolvePublicApiToken();
    if (!token) {
      throw new Error("You must be logged in to continue this assignment.");
    }

    const result = await publicApiPost<ItemResponse<PublicAttemptProgressResult>>(
      `/api/public/attempts/${attemptId}/progress`,
      token,
      getAttemptProgressBody(event),
    );

    onAttemptUpdate?.(result.item.attempt);

    return {
      nextNodeId: result.item.next_node_id,
      completed: result.item.completed || result.item.attempt.status === "submitted",
      feedback: result.item.response?.feedback?.trim() || null,
    };
  };

  const dispatch = async (event: ScenarioEvent) => {
    if (!loadedScenario || !currentNode) {
      return;
    }

    setActionErrorMessage(null);
    setBusy(true);

    try {
      const outcome = attemptId
        ? await runAttemptProgress(event)
        : await runLocalProgress(currentNode, loadedScenario, event);

      if (outcome.feedback) {
        setPendingFeedback({
          feedback: outcome.feedback,
          nextNodeId: outcome.nextNodeId,
          completed: outcome.completed,
        });
        return;
      }

      applyProgressOutcome(outcome.nextNodeId, outcome.completed);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setActionErrorMessage(error.message);
      } else if (error instanceof Error) {
        setActionErrorMessage(error.message);
      } else {
        setActionErrorMessage("Failed to advance the scenario.");
      }
    } finally {
      setBusy(false);
    }
  };

  switch (scenarioState) {
    case "loading":
      return (
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Loading scenario...
        </p>
      );
    case "doing": {
      if (!loadedScenario || !currentNode) {
        return (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Loading scenario...
          </p>
        );
      }

      return (
        <>
          <SceneRenderer
            key={currentNode.id}
            node={currentNode}
            edges={loadedScenario.edges}
            busy={busy}
            errorMessage={actionErrorMessage}
            dispatch={dispatch}
          />

          {/* TODO This should be in the scene renderer itself, No? */}
          {pendingFeedback ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-2xl rounded-xl border border-white/20 bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-semibold text-white">Feedback</h3>
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      applyProgressOutcome(
                        pendingFeedback.nextNodeId,
                        pendingFeedback.completed,
                      );
                      setPendingFeedback(null);
                    }}
                    aria-label="Close feedback"
                  >
                    Continue
                  </button>
                </div>
                <pre className="mt-3 whitespace-pre-wrap text-sm text-white/80">
                  {pendingFeedback.feedback}
                </pre>
              </div>
            </div>
          ) : null}
        </>
      );
    }
    case "finished":
      if (onFinished) {
        return null;
      }

      return (
        <div className="space-y-3 rounded-xl border border-neutral-300 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-neutral-700 dark:text-neutral-200">
            You have reached the end of {loadedScenario?.title ?? "this scenario"}.
          </p>
          {loadedScenario ? (
            <button
              type="button"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
              onClick={() =>
                initializeScenario(
                  loadedScenario,
                  initialNodeId ?? loadedScenario.startNodeId,
                )
              }
            >
              Run again
            </button>
          ) : null}
        </div>
      );
    case "error":
      return (
        <p className="text-sm text-rose-600 dark:text-rose-300">
          {errorMessage ?? "The scenario could not be loaded."}
        </p>
      );
  }
}

export default ScenarioViewer;
