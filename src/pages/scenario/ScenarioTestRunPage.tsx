import { Link, useParams } from 'react-router-dom';

import { useScenario } from '../../lib/usePublicApiHooks';
import { toUuidOrNull } from '../../lib/uuid';
import ScenarioViewer from './viewer/ScenarioViewer';
import {
  createScenarioDraftGuard,
  useScenarioDraftDocument,
} from './hooks/useScenarioPageData';
import { DataGuard } from '../../components/data/DataGuard';
import PageShell from '../../components/layout/PageShell';

function ScenarioTestRunPage() {
  const { scenarioId: scenarioIdParam } = useParams();
  const scenarioId = toUuidOrNull(scenarioIdParam);
  const scenario = useScenario(scenarioId);
  const { scenarioDocument, parseError } = useScenarioDraftDocument(scenario.item);
  const guard = createScenarioDraftGuard({
    scenarioId,
    scenarioState: scenario,
    scenarioDocument,
    parseError,
  });

  const scenarioTitle =
    scenario.item?.title.trim().length
      ? scenario.item.title
      : scenario.item
        ? `Scenario ${scenario.item.id}`
        : 'Scenario';

  return (
    <PageShell
      title="Scenario Test Run"
      subtitle={
        scenario.item
          ? `${scenarioTitle} (ID ${scenario.item.id})`
          : scenarioId
            ? `Scenario ID: ${scenarioId}`
            : 'Invalid scenario identifier'
      }
    >
      <DataGuard state={guard}>
        {scenario.item && scenarioDocument ? (
          <>
            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              <Link
                to={`/scenario/${scenario.item.id}/editor`}
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
              <ScenarioViewer scenario={scenarioDocument} />
            </div>
          </>
        ) : null}
      </DataGuard>
    </PageShell>
  );
}

export default ScenarioTestRunPage;
