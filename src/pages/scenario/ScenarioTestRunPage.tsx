import { Link, useParams } from "react-router-dom";

import { useScenario } from "../../lib/usePublicApiHooks";
import { toUuidOrNull } from "../../lib/uuid";
import ScenarioViewer from "./viewer/ScenarioViewer";
import {
  createScenarioDraftGuard,
  useScenarioDraftDocument,
} from "./hooks/useScenarioPageData";
import { DataGuard } from "../../components/data/DataGuard";
import PageShell from "../../components/layout/PageShell";

function ScenarioTestRunPage() {
  const { scenarioId: scenarioIdParam } = useParams();
  const scenarioId = toUuidOrNull(scenarioIdParam);
  const scenario = useScenario(scenarioId);
  const { scenarioDocument, parseError } = useScenarioDraftDocument(
    scenario.item,
  );
  const guard = createScenarioDraftGuard({
    scenarioId,
    scenarioState: scenario,
    scenarioDocument,
    parseError,
  });

  const scenarioTitle = scenario.item?.title.trim().length
    ? scenario.item.title
    : scenario.item
      ? `Scenario ${scenario.item.id}`
      : "Scenario";

  return (
    <PageShell
      title="Scenario Test Run"
      subtitle={
        scenario.item
          ? `${scenarioTitle} (ID ${scenario.item.id})`
          : scenarioId
            ? `Scenario ID: ${scenarioId}`
            : "Invalid scenario identifier"
      }
    >
      <DataGuard state={guard}>
        {scenario.item && scenarioDocument ? (
          <>
            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              <Link
                to={`/scenario/${scenario.item.id}/editor`}
                className="rounded-md border border-neutral-700 px-3 py-1.5 font-semibold !text-neutral-800 dark:!text-neutral-200 transition hover:border-cyan-600/60 hover:!text-cyan-500 dark:hover:border-cyan-400/60 dark:hover:!text-cyan-200"
              >
                Edit Scenario
              </Link>
              <Link
                to="/scenario/library"
                className="rounded-md border border-neutral-700 px-3 py-1.5 font-semibold !text-neutral-800 dark:!text-neutral-200 transition hover:border-neutral-400 hover:!text-neutral-500 dark:hover:border-neutral-300/60 dark:hover:!text-neutral-400"
              >
                Back to Library
              </Link>
            </div>

            <ScenarioViewer scenario={scenarioDocument} />
          </>
        ) : null}
      </DataGuard>
    </PageShell>
  );
}

export default ScenarioTestRunPage;
