import ScenarioCreator from "./ScenarioCreator";
import './Creator.css'

function ScenarioCreatorDemo() {
    return (
        <div className="creator-demo">
            <ScenarioCreator scenarioUrl="/scenarios/creator.json" />
        </div>
    );
}

export default ScenarioCreatorDemo;
