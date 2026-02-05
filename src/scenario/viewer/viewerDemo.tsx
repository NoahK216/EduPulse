import ScenarioViewer from "./ScenarioViewer";

function ScenarioViewerDemo() {
  return (
    <div className="view-demo" style={{ display: 'flex', width: '100vw', justifyContent: 'center' }}>
      <ScenarioViewer scenarioUrl="/scenarios/creator.json" />
    </div>
  );
}

export default ScenarioViewerDemo;
