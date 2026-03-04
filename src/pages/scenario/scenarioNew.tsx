import { useMemo } from 'react';

import ScenarioCreator from './creator/ScenarioCreator';
import { buildStarterScenario } from './creator/starterScenario';
import '../scenario/creator/Creator.css';

function ScenarioNewPage() {
  const initialScenario = useMemo(() => buildStarterScenario(), []);

  return (
    <div className="creator-demo">
      <ScenarioCreator initialScenario={initialScenario} />
    </div>
  );
}

export default ScenarioNewPage;
