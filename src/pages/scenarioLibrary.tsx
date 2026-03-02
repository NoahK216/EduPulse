import { Link } from 'react-router-dom';

import { useApiData } from './hooks/useApiData';
import { EmptyPanel, ErrorPanel, LoadingPanel, UnauthorizedPanel } from './ui/DataStatePanels';
import PageShell from './ui/PageShell';
import type {
  PagedResponse,
  PublicScenario,
  PublicScenarioVersion,
} from '../types/publicApi';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function ScenarioLibrary() {
  const scenarios = useApiData<PagedResponse<PublicScenario>>('/api/public/scenarios?pageSize=100');
  const versions = useApiData<PagedResponse<PublicScenarioVersion>>(
    '/api/public/scenario-versions?pageSize=100'
  );

  const unauthorized = scenarios.unauthorized || versions.unauthorized;
  const isLoading = scenarios.loading || versions.loading;
  const hasError = scenarios.error || versions.error;

  return (
    <PageShell title="Scenario Library" subtitle="Scenarios and published versions">
      {unauthorized ? <UnauthorizedPanel /> : null}
      {!unauthorized && isLoading ? <LoadingPanel /> : null}
      {!unauthorized && !isLoading && hasError ? (
        <ErrorPanel
          message={hasError}
          onRetry={() => {
            scenarios.refetch();
            versions.refetch();
          }}
        />
      ) : null}

      {!unauthorized && !isLoading && !hasError ? (
        <section>
          <h2 className="text-lg font-semibold">Scenarios</h2>
          {scenarios.data && scenarios.data.items.length === 0 ? (
            <EmptyPanel message="No scenarios found." />
          ) : null}
          {scenarios.data && scenarios.data.items.length > 0 ? (
            <div className="mt-3 space-y-2">
              {scenarios.data.items.map((scenario) => (
                <Link
                  key={scenario.id}
                  to={`/scenario/library/scenario/${scenario.id}`}
                  className="block rounded border border-neutral-800 bg-neutral-800 px-3 py-2 text-sm hover:border-neutral-700"
                >
                  <p className="font-medium">{scenario.title}</p>
                  <p className="text-xs text-neutral-400">
                    Updated: {formatDate(scenario.updated_at)}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {!unauthorized && !isLoading && !hasError ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Published Versions</h2>
          {versions.data && versions.data.items.length === 0 ? (
            <EmptyPanel message="No scenario versions found." />
          ) : null}
          {versions.data && versions.data.items.length > 0 ? (
            <div className="mt-3 space-y-2">
              {versions.data.items.map((version) => (
                <Link
                  key={version.id}
                  to={`/scenario/library/version/${version.id}`}
                  className="block rounded border border-neutral-800 bg-neutral-800 px-3 py-2 text-sm hover:border-neutral-700"
                >
                  <p className="font-medium">
                    {version.scenario_title} - v{version.version_number}
                  </p>
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

export default ScenarioLibrary;
