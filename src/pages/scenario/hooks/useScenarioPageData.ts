import { useMemo } from "react";

import type { ScenarioState } from "../../../lib/usePublicApiHooks";
import type { PublicScenario } from "../../../types/publicApi";
import type { DataGuardState } from "../../../components/data/DataGuard";
import type { Scenario } from "../scenarioSchemas";
import { ScenarioSchema } from "../scenarioSchemas";
import { buildStarterScenario } from "../creator/starterScenario";

const CONTENT_GUARD: DataGuardState = { kind: "content" };

export function useScenarioDraftDocument(scenario: PublicScenario | null) {
  return useMemo(() => {
    if (!scenario) {
      return {
        scenarioDocument: null as Scenario | null,
        parseError: null as string | null,
      };
    }

    if (
      scenario.draft_content === null ||
      typeof scenario.draft_content === "undefined"
    ) {
      return {
        scenarioDocument: buildStarterScenario({
          scenarioId: scenario.id,
          title:
            scenario.title.trim().length > 0
              ? scenario.title
              : `Scenario ${scenario.id}`,
        }),
        parseError: null,
      };
    }

    const parsed = ScenarioSchema.safeParse(scenario.draft_content);
    if (!parsed.success) {
      return {
        scenarioDocument: null,
        parseError: "Stored draft_content is not a valid Scenario document.",
      };
    }

    return {
      scenarioDocument: parsed.data,
      parseError: null,
    };
  }, [scenario]);
}

export function createScenarioDraftGuard({
  scenarioId,
  scenarioState,
  scenarioDocument,
  parseError,
}: {
  scenarioId: string | null;
  scenarioState: ScenarioState;
  scenarioDocument: Scenario | null;
  parseError: string | null;
}): DataGuardState {
  if (!scenarioId) {
    return {
      kind: "invalid",
      message: "The scenario ID in the URL is invalid.",
    };
  }

  if (scenarioState.unauthorized) {
    return { kind: "unauthorized" };
  }

  if (scenarioState.loading) {
    return { kind: "loading" };
  }

  if (scenarioState.error) {
    return {
      kind: "error",
      message: scenarioState.error,
      onRetry: scenarioState.refetch,
    };
  }

  if (!scenarioState.item) {
    return {
      kind: "error",
      message: "Scenario not found.",
    };
  }

  if (parseError || !scenarioDocument) {
    return {
      kind: "error",
      message: parseError ?? "Failed to load scenario draft",
    };
  }

  return CONTENT_GUARD;
}
