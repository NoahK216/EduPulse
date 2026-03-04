import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { Scenario } from './scenarioSchemas';
import { ScenarioSchema } from './scenarioSchemas';
import { buildStarterScenario } from './creator/starterScenario';
import ScenarioViewer from './viewer/ScenarioViewer';
import { useApiData } from '../../lib/useApiData';
import { ErrorPanel, LoadingPanel, UnauthorizedPanel } from '../ui/DataStatePanels';
import PageShell from '../ui/PageShell';
import type { ItemResponse, PublicScenario } from '../../types/publicApi';

function ScenarioViewerPage() {
  const { scenarioId } = useParams();
  const parsedScenarioId = Number.parseInt(scenarioId ?? '', 10);
  const hasValidId = Number.isInteger(parsedScenarioId) && parsedScenarioId > 0;

  const scenario = useApiData<ItemResponse<PublicScenario>>(
    hasValidId ? `/api/public/scenarios/${parsedScenarioId}` : null,
  );

  const parsedScenario = useMemo(() => {
    const item = scenario.data?.item;
    if (!item) {
      return {
        scenario: null as Scenario | null,
        parseError: null as string | null,
      };
    }

    if (item.draft_content === null || typeof item.draft_content === 'undefined') {
      return {
        scenario: buildStarterScenario({
          scenarioId: item.id,
          title: item.title.trim().length > 0 ? item.title : `Scenario ${item.id}`,
        }),
        parseError: null,
      };
    }

    const parsed = ScenarioSchema.safeParse(item.draft_content);
    if (!parsed.success) {
      return {
        scenario: null,
        parseError: 'Stored draft_content is not a valid Scenario document.',
      };
    }

    return {
      scenario: parsed.data,
      parseError: null,
    };
  }, [scenario.data]);

  if (!hasValidId) {
    return (
      <PageShell title="Scenario Test Run" subtitle="Invalid scenario identifier">
        <ErrorPanel message="The scenario ID in the URL is invalid." />
      </PageShell>
    );
  }

  if (scenario.unauthorized) {
    return (
      <PageShell title="Scenario Test Run" subtitle={`Scenario ID: ${parsedScenarioId}`}>
        <UnauthorizedPanel />
      </PageShell>
    );
  }

  if (scenario.loading) {
    return (
      <PageShell title="Scenario Test Run" subtitle={`Scenario ID: ${parsedScenarioId}`}>
        <LoadingPanel />
      </PageShell>
    );
  }

  if (scenario.error) {
    return (
      <PageShell title="Scenario Test Run" subtitle={`Scenario ID: ${parsedScenarioId}`}>
        <ErrorPanel message={scenario.error} onRetry={scenario.refetch} />
      </PageShell>
    );
  }

  if (!scenario.data?.item) {
    return (
      <PageShell title="Scenario Test Run" subtitle={`Scenario ID: ${parsedScenarioId}`}>
        <ErrorPanel message="Scenario not found." />
      </PageShell>
    );
  }

  if (parsedScenario.parseError || !parsedScenario.scenario) {
    return (
      <PageShell title="Scenario Test Run" subtitle={`Scenario ID: ${parsedScenarioId}`}>
        <ErrorPanel message={parsedScenario.parseError ?? 'Failed to load scenario draft'} />
      </PageShell>
    );
  }

  const scenarioTitle =
    scenario.data.item.title.trim().length > 0
      ? scenario.data.item.title
      : `Scenario ${scenario.data.item.id}`;

  return (
    <PageShell title="Scenario Test Run" subtitle={`${scenarioTitle} (ID ${scenario.data.item.id})`}>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          to={`/scenario/${scenario.data.item.id}/editor`}
          className="rounded-md border border-neutral-700 px-3 py-1.5 font-semibold !text-neutral-200 transition hover:border-cyan-400/60 hover:!text-cyan-100"
        >
          Edit Scenario
        </Link>
        <Link
          to="/scenario/library"
          className="rounded-md border border-neutral-700 px-3 py-1.5 font-semibold !text-neutral-200 transition hover:border-neutral-500"
        >
          Back to Library
        </Link>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
        <ScenarioViewer scenario={parsedScenario.scenario} />
      </div>
    </PageShell>
  );
}

export default ScenarioViewerPage;
