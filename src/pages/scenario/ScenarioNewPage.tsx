import { useMemo } from 'react';

import ScenarioCreator from './creator/ScenarioCreator';
import { buildStarterScenario } from './creator/starterScenario';
import './creator/Creator.css';

function ScenarioNewPage() {
  const initialScenario = useMemo(() => buildStarterScenario(), []);

  return (
    <ScenarioCreator initialScenario={initialScenario} />
  );
}

export default ScenarioNewPage;
