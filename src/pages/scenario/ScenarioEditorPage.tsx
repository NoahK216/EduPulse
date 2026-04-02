import { Link, useParams } from 'react-router-dom';

import ScenarioCreator from './creator/ScenarioCreator';
import { useScenarioDraftData } from './hooks/useScenarioPageData';
import './creator/Creator.css';
import { DataGuard } from '../../components/data/DataGuard';
import PageShell from '../../components/layout/PageShell';

function ScenarioEditorPage() {
  const { scenarioId } = useParams();
  const data = useScenarioDraftData(scenarioId);

  if (data.guard.kind !== 'content' || !data.scenarioDocument || !data.scenarioItem) {
    return (
      <PageShell
        title="Scenario Editor"
        subtitle={
          data.scenarioId ? `Scenario ID: ${data.scenarioId}` : 'Invalid scenario identifier'
        }
      >
        <DataGuard state={data.guard}>{null}</DataGuard>
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
      initialScenario={data.scenarioDocument}
      initialScenarioId={data.scenarioItem.id}
      initialDescription={data.scenarioItem.description ?? null}
    />
  );
}

export default ScenarioEditorPage;
