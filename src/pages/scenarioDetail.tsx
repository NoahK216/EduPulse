import { Link, useParams } from 'react-router-dom';

import { useApiData } from './hooks/useApiData';
import { EmptyPanel, ErrorPanel, LoadingPanel, UnauthorizedPanel } from './ui/DataStatePanels';
import PageShell from './ui/PageShell';
import type {
  ItemResponse,
  PagedResponse,
  PublicScenario,
  PublicScenarioVersion,
} from '../types/publicApi';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function ScenarioDetail() {
  const { scenarioId } = useParams();
  const parsedScenarioId = Number.parseInt(scenarioId ?? '', 10);
  const hasValidId = Number.isInteger(parsedScenarioId) && parsedScenarioId > 0;

  const scenarioPath = hasValidId ? `/api/public/scenarios/${parsedScenarioId}` : null;
  const versionsPath = hasValidId
    ? `/api/public/scenario-versions?scenarioId=${parsedScenarioId}`
    : null;

  const scenario = useApiData<ItemResponse<PublicScenario>>(scenarioPath);
  const versions = useApiData<PagedResponse<PublicScenarioVersion>>(versionsPath);

  if (!hasValidId) {
    return (
      <PageShell title="Scenario" subtitle="Invalid scenario identifier">
        <ErrorPanel message="The scenario ID in the URL is invalid." />
      </PageShell>
    );
  }

  const unauthorized = scenario.unauthorized || versions.unauthorized;

  return (
    <PageShell title="Scenario Details" subtitle={`Scenario ID: ${parsedScenarioId}`}>
      <div className="mb-4">
        <Link to="/scenario/library" className="text-sm text-blue-300 hover:text-blue-200">
          Back to library
        </Link>
      </div>

      {unauthorized ? <UnauthorizedPanel /> : null}
      {!unauthorized && scenario.loading ? <LoadingPanel /> : null}
      {!unauthorized && !scenario.loading && scenario.error ? (
        <ErrorPanel message={scenario.error} onRetry={scenario.refetch} />
      ) : null}
      {!unauthorized && !scenario.loading && !scenario.error && !scenario.data ? (
        <EmptyPanel message="Scenario not found." />
      ) : null}

      {!unauthorized && scenario.data?.item ? (
        <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
          <h2 className="text-xl font-semibold">{scenario.data.item.title}</h2>
          {scenario.data.item.description ? (
            <p className="mt-2 text-sm text-neutral-200">{scenario.data.item.description}</p>
          ) : null}
          <p className="mt-2 text-sm text-neutral-300">
            Latest version: {scenario.data.item.latest_version_number}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Updated: {formatDate(scenario.data.item.updated_at)}
          </p>
        </section>
      ) : null}

      {!unauthorized && scenario.data?.item ? (
        <section className="mt-6">
          <h3 className="text-lg font-semibold">Published Versions</h3>
          {versions.loading ? <LoadingPanel /> : null}
          {!versions.loading && versions.error ? (
            <ErrorPanel message={versions.error} onRetry={versions.refetch} />
          ) : null}
          {!versions.loading && !versions.error && versions.data && versions.data.items.length === 0 ? (
            <EmptyPanel message="No versions found for this scenario." />
          ) : null}
          {!versions.loading && !versions.error && versions.data && versions.data.items.length > 0 ? (
            <div className="mt-3 space-y-2">
              {versions.data.items.map((version) => (
                <Link
                  key={version.id}
                  to={`/scenario/library/version/${version.id}`}
                  className="block rounded border border-neutral-800 bg-neutral-800 px-3 py-2 text-sm hover:border-neutral-700"
                >
                  <p className="font-medium">Version {version.version_number}</p>
                  <p className="text-xs text-neutral-400">
                    Published: {formatDate(version.published_at)}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </PageShell>
  );
}

export default ScenarioDetail;
