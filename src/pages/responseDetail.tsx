import { Link, useParams } from 'react-router-dom';

import { useApiData } from './hooks/useApiData';
import { EmptyPanel, ErrorPanel, LoadingPanel, UnauthorizedPanel } from './ui/DataStatePanels';
import PageShell from './ui/PageShell';
import type { ItemResponse, PublicResponse } from '../types/publicApi';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function ResponseDetail() {
  const { classroomId, assignmentId, attemptId, responseId } = useParams();
  const parsedClassroomId = Number.parseInt(classroomId ?? '', 10);
  const parsedAssignmentId = Number.parseInt(assignmentId ?? '', 10);
  const parsedAttemptId = Number.parseInt(attemptId ?? '', 10);
  const parsedResponseId = Number.parseInt(responseId ?? '', 10);
  const hasValidIds =
    Number.isInteger(parsedClassroomId) &&
    parsedClassroomId > 0 &&
    Number.isInteger(parsedAssignmentId) &&
    parsedAssignmentId > 0 &&
    Number.isInteger(parsedAttemptId) &&
    parsedAttemptId > 0 &&
    Number.isInteger(parsedResponseId) &&
    parsedResponseId > 0;

  const path = hasValidIds ? `/api/public/responses/${parsedResponseId}` : null;
  const response = useApiData<ItemResponse<PublicResponse>>(path);

  return (
    <PageShell title="Response Details" subtitle={`Response ID: ${responseId ?? ''}`}>
      <div className="mb-4">
        <Link
          to={
            hasValidIds
              ? `/classrooms/${parsedClassroomId}/assignment/${parsedAssignmentId}/attempt/${parsedAttemptId}`
              : '/classrooms'
          }
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          Back
        </Link>
      </div>

      {!hasValidIds ? <ErrorPanel message="Invalid route identifiers." /> : null}
      {hasValidIds && response.unauthorized ? <UnauthorizedPanel /> : null}
      {hasValidIds && !response.unauthorized && response.loading ? <LoadingPanel /> : null}
      {hasValidIds && !response.unauthorized && !response.loading && response.error ? (
        <ErrorPanel message={response.error} onRetry={response.refetch} />
      ) : null}
      {hasValidIds && !response.unauthorized && !response.loading && !response.error && !response.data ? (
        <EmptyPanel message="Response not found." />
      ) : null}

      {hasValidIds && response.data?.item ? (
        <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
          <h2 className="text-xl font-semibold">Node: {response.data.item.node_id}</h2>
          <p className="mt-1 text-sm text-neutral-300">
            Created: {formatDate(response.data.item.created_at)}
          </p>
          <p className="mt-1 text-sm text-neutral-300">
            Student: {response.data.item.student_name}
          </p>
          <p className="mt-3 text-sm text-neutral-200">
            Feedback: {response.data.item.feedback ?? 'No feedback'}
          </p>

          {typeof response.data.item.response_payload !== 'undefined' ? (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-neutral-200">Payload</h3>
              <pre className="overflow-x-auto rounded bg-neutral-900 p-3 text-xs text-neutral-200">
                {JSON.stringify(response.data.item.response_payload, null, 2)}
              </pre>
            </div>
          ) : null}
        </section>
      ) : null}
    </PageShell>
  );
}

export default ResponseDetail;
