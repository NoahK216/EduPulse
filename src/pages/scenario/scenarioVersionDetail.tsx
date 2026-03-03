import { Link, useParams } from 'react-router-dom';

import { useApiData } from '../../lib/useApiData';
import { EmptyPanel, ErrorPanel, LoadingPanel, UnauthorizedPanel } from '../ui/DataStatePanels';
import PageShell from '../ui/PageShell';
import type { ItemResponse, PublicScenarioVersion } from '../../types/publicApi';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function ScenarioVersionDetail() {
  const { versionId } = useParams();
  const parsedVersionId = Number.parseInt(versionId ?? '', 10);
  const hasValidId = Number.isInteger(parsedVersionId) && parsedVersionId > 0;

  const path = hasValidId ? `/api/public/scenario-versions/${parsedVersionId}` : null;
  const version = useApiData<ItemResponse<PublicScenarioVersion>>(path);

  return (
    <PageShell title="Scenario Version" subtitle={`Version ID: ${versionId ?? ''}`}>
      <div className="mb-4">
        <Link to="/scenario/library" className="text-sm text-blue-300 hover:text-blue-200">
          Back to library
        </Link>
      </div>

      {!hasValidId ? <ErrorPanel message="Invalid version identifier." /> : null}
      {hasValidId && version.unauthorized ? <UnauthorizedPanel /> : null}
      {hasValidId && !version.unauthorized && version.loading ? <LoadingPanel /> : null}
      {hasValidId && !version.unauthorized && !version.loading && version.error ? (
        <ErrorPanel message={version.error} onRetry={version.refetch} />
      ) : null}
      {hasValidId && !version.unauthorized && !version.loading && !version.error && !version.data ? (
        <EmptyPanel message="Scenario version not found." />
      ) : null}

      {hasValidId && version.data?.item ? (
        <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
          <h2 className="text-xl font-semibold">
            {version.data.item.scenario_title} - v{version.data.item.version_number}
          </h2>
          <p className="mt-1 text-sm text-neutral-300">Title: {version.data.item.title}</p>
          <p className="mt-1 text-sm text-neutral-300">
            Published by: {version.data.item.published_by_name}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Published at: {formatDate(version.data.item.published_at)}
          </p>
          <p className="mt-2 text-sm text-neutral-300">
            Linked assignments: {version.data.item.assignment_count}
          </p>
        </section>
      ) : null}
    </PageShell>
  );
}

export default ScenarioVersionDetail;
