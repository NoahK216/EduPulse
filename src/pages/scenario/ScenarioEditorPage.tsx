import { Link, useParams } from 'react-router-dom';

import { useScenario } from '../../lib/usePublicApiHooks';
import { toUuidOrNull } from '../../lib/uuid';
import ScenarioCreator from './creator/ScenarioCreator';
import {
  createScenarioDraftGuard,
  useScenarioDraftDocument,
} from './hooks/useScenarioPageData';
import './creator/Creator.css';
import { DataGuard } from '../../components/data/DataGuard';
import PageShell from '../../components/layout/PageShell';

function ScenarioEditorPage() {
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

  if (guard.kind !== 'content' || !scenarioDocument || !scenario.item) {
    return (
      <PageShell
        title="Scenario Editor"
        subtitle={
          scenarioId ? `Scenario ID: ${scenarioId}` : 'Invalid scenario identifier'
        }
      >
        <DataGuard state={guard}>{null}</DataGuard>
        <div className="mt-4">
          <Link to="/scenario/library" className="text-sm text-blue-300 hover:text-blue-200">
            Back to library
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <ScenarioCreator
      initialScenario={scenarioDocument}
      initialScenarioId={scenario.item.id}
    />
  );
}

export default ScenarioEditorPage;
