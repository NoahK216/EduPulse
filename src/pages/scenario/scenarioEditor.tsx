import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { isUuid } from '../../lib/uuid';
import type { Scenario } from './scenarioSchemas';
import { ScenarioSchema } from './scenarioSchemas';
import ScenarioCreator from './creator/ScenarioCreator';
import { buildStarterScenario } from './creator/starterScenario';
import '../scenario/creator/Creator.css';
import { useApiData } from '../../lib/useApiData';
import { ErrorPanel, LoadingPanel, UnauthorizedPanel } from '../ui/DataStatePanels';
import PageShell from '../ui/PageShell';
import type { ItemResponse, PublicScenario } from '../../types/publicApi';

function ScenarioEditorPage() {
  const { scenarioId } = useParams();
  const scenarioIdValue = isUuid(scenarioId) ? scenarioId : null;
  const hasValidId = scenarioIdValue !== null;

  const scenario = useApiData<ItemResponse<PublicScenario>>(
    hasValidId ? `/api/public/scenarios/${scenarioIdValue}` : null,
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
      <PageShell title="Scenario Editor" subtitle="Invalid scenario identifier">
        <ErrorPanel message="The scenario ID in the URL is invalid." />
      </PageShell>
    );
  }

  if (scenario.unauthorized) {
    return (
      <PageShell title="Scenario Editor" subtitle={`Scenario ID: ${scenarioIdValue}`}>
        <UnauthorizedPanel />
      </PageShell>
    );
  }

  if (scenario.loading) {
    return (
      <PageShell title="Scenario Editor" subtitle={`Scenario ID: ${scenarioIdValue}`}>
        <LoadingPanel />
      </PageShell>
    );
  }

  if (scenario.error) {
    return (
      <PageShell title="Scenario Editor" subtitle={`Scenario ID: ${scenarioIdValue}`}>
        <ErrorPanel message={scenario.error} onRetry={scenario.refetch} />
      </PageShell>
    );
  }

  if (!scenario.data?.item) {
    return (
      <PageShell title="Scenario Editor" subtitle={`Scenario ID: ${scenarioIdValue}`}>
        <ErrorPanel message="Scenario not found." />
      </PageShell>
    );
  }

  if (parsedScenario.parseError || !parsedScenario.scenario) {
    return (
      <PageShell title="Scenario Editor" subtitle={`Scenario ID: ${scenarioIdValue}`}>
        <ErrorPanel message={parsedScenario.parseError ?? 'Failed to load scenario draft'} />
        <div className="mt-4">
          <Link to="/scenario/library" className="text-sm text-blue-300 hover:text-blue-200">
            Back to library
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <div className="creator-demo">
      <ScenarioCreator
        initialScenario={parsedScenario.scenario}
        initialScenarioId={scenario.data.item.id}
      />
    </div>
  );
}

export default ScenarioEditorPage;
