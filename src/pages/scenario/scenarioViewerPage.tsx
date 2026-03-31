import { Link, useParams } from 'react-router-dom';

import ScenarioViewer from './viewer/ScenarioViewer';
import { useScenarioDraftData } from './hooks/useScenarioPageData';
import { DataGuard } from '../ui/DataGuard';
import PageShell from '../ui/PageShell';

function ScenarioViewerPage() {
  const { scenarioId } = useParams();
  const data = useScenarioDraftData(scenarioId);

  const scenarioTitle =
    data.scenarioItem?.title.trim().length
      ? data.scenarioItem.title
      : data.scenarioItem
        ? `Scenario ${data.scenarioItem.id}`
        : 'Scenario';

  return (
    <PageShell
      title="Scenario Test Run"
      subtitle={
        data.scenarioItem
          ? `${scenarioTitle} (ID ${data.scenarioItem.id})`
          : data.scenarioId
            ? `Scenario ID: ${data.scenarioId}`
            : 'Invalid scenario identifier'
      }
    >
      <DataGuard state={data.guard}>
        {data.scenarioItem && data.scenarioDocument ? (
          <>
            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              <Link
                to={`/scenario/${data.scenarioItem.id}/editor`}
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
              <ScenarioViewer scenario={data.scenarioDocument} />
            </div>
          </>
        ) : null}
      </DataGuard>
    </PageShell>
  );
}

export default ScenarioViewerPage;
