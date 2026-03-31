import { useMemo } from 'react';

import { useScenario, useScenarios, useScenarioVersions } from '../../../lib/usePublicApiHooks';
import { toUuidOrNull } from '../../../lib/uuid';
import type { PublicScenario, PublicScenarioVersion } from '../../../types/publicApi';
import type { DataGuardState } from "../../../components/data/DataGuard";
import type { Scenario } from '../scenarioSchemas';
import { ScenarioSchema } from '../scenarioSchemas';
import { buildStarterScenario } from '../creator/starterScenario';

type ScenarioDraftData = {
  scenarioId: string | null;
  scenarioItem: PublicScenario | null;
  scenarioDocument: Scenario | null;
  guard: DataGuardState;
};

type ScenarioLibraryData = {
  scenarios: PublicScenario[];
  versions: PublicScenarioVersion[];
  guard: DataGuardState;
  refetch: () => void;
};

const CONTENT_GUARD: DataGuardState = { kind: 'content' };

export function useScenarioDraftData(
  scenarioId: string | null | undefined,
): ScenarioDraftData {
  const validScenarioId = toUuidOrNull(scenarioId);
  const scenario = useScenario(validScenarioId);
  const parsedScenario = useMemo(() => {
    const item = scenario.item;

    if (!item) {
      return {
        scenarioDocument: null as Scenario | null,
        parseError: null as string | null,
      };
    }

    if (item.draft_content === null || typeof item.draft_content === 'undefined') {
      return {
        scenarioDocument: buildStarterScenario({
          scenarioId: item.id,
          title: item.title.trim().length > 0 ? item.title : `Scenario ${item.id}`,
        }),
        parseError: null,
      };
    }

    const parsed = ScenarioSchema.safeParse(item.draft_content);

    if (!parsed.success) {
      return {
        scenarioDocument: null,
        parseError: 'Stored draft_content is not a valid Scenario document.',
      };
    }

    return {
      scenarioDocument: parsed.data,
      parseError: null,
    };
  }, [scenario.item]);

  let guard: DataGuardState = CONTENT_GUARD;

  if (!validScenarioId) {
    guard = {
      kind: 'invalid',
      message: 'The scenario ID in the URL is invalid.',
    };
  } else if (scenario.unauthorized) {
    guard = { kind: 'unauthorized' };
  } else if (scenario.loading) {
    guard = { kind: 'loading' };
  } else if (scenario.error) {
    guard = {
      kind: 'error',
      message: scenario.error,
      onRetry: scenario.refetch,
    };
  } else if (!scenario.item) {
    guard = {
      kind: 'error',
      message: 'Scenario not found.',
    };
  } else if (parsedScenario.parseError || !parsedScenario.scenarioDocument) {
    guard = {
      kind: 'error',
      message: parsedScenario.parseError ?? 'Failed to load scenario draft',
    };
  }

  return {
    scenarioId: validScenarioId,
    scenarioItem: scenario.item,
    scenarioDocument: parsedScenario.scenarioDocument,
    guard,
  };
}

export function useScenarioLibraryData(): ScenarioLibraryData {
  const scenarios = useScenarios();
  const versions = useScenarioVersions();

  let guard: DataGuardState = CONTENT_GUARD;

  if (scenarios.unauthorized || versions.unauthorized) {
    guard = { kind: 'unauthorized' };
  } else if (scenarios.loading || versions.loading) {
    guard = { kind: 'loading' };
  } else if (scenarios.error || versions.error) {
    guard = {
      kind: 'error',
      message: scenarios.error ?? versions.error ?? 'Failed to load scenario library.',
      onRetry: () => {
        scenarios.refetch();
        versions.refetch();
      },
    };
  }

  return {
    scenarios: scenarios.items,
    versions: versions.items,
    guard,
    refetch: () => {
      scenarios.refetch();
      versions.refetch();
    },
  };
}
