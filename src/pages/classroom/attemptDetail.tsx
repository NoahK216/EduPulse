import { Link, useParams } from 'react-router-dom';

import { useApiData } from '../../lib/useApiData';
import { EmptyPanel, ErrorPanel, LoadingPanel, UnauthorizedPanel } from '../ui/DataStatePanels';
import PageShell from '../ui/PageShell';
import type { ItemResponse, PagedResponse, PublicAttempt, PublicResponse } from '../../types/publicApi';

function formatDate(value: string | null) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
}

function AttemptDetail() {
  const { classroomId, assignmentId, attemptId } = useParams();
  const parsedClassroomId = Number.parseInt(classroomId ?? '', 10);
  const parsedAssignmentId = Number.parseInt(assignmentId ?? '', 10);
  const parsedAttemptId = Number.parseInt(attemptId ?? '', 10);
  const hasValidIds =
    Number.isInteger(parsedClassroomId) &&
    parsedClassroomId > 0 &&
    Number.isInteger(parsedAssignmentId) &&
    parsedAssignmentId > 0 &&
    Number.isInteger(parsedAttemptId) &&
    parsedAttemptId > 0;

  const attemptPath = hasValidIds ? `/api/public/attempts/${parsedAttemptId}` : null;
  const responsesPath = hasValidIds ? `/api/public/responses?attemptId=${parsedAttemptId}` : null;

  const attempt = useApiData<ItemResponse<PublicAttempt>>(attemptPath);
  const responses = useApiData<PagedResponse<PublicResponse>>(responsesPath);

  if (!hasValidIds) {
    return (
      <PageShell title="Attempt" subtitle="Invalid attempt identifier">
        <ErrorPanel message="The classroom, assignment, or attempt ID in the URL is invalid." />
      </PageShell>
    );
  }

  const unauthorized = attempt.unauthorized || responses.unauthorized;

  return (
    <PageShell title="Attempt Details" subtitle={`Attempt ID: ${parsedAttemptId}`}>
      <div className="mb-4">
        <Link
          to={`/classrooms/${parsedClassroomId}/assignment/${parsedAssignmentId}`}
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          Back to assignment
        </Link>
      </div>

      {unauthorized ? <UnauthorizedPanel /> : null}
      {!unauthorized && attempt.loading ? <LoadingPanel /> : null}
      {!unauthorized && !attempt.loading && attempt.error ? (
        <ErrorPanel message={attempt.error} onRetry={attempt.refetch} />
      ) : null}
      {!unauthorized && !attempt.loading && !attempt.error && !attempt.data ? (
        <EmptyPanel message="Attempt not found." />
      ) : null}

      {!unauthorized && attempt.data?.item ? (
        <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
          <h2 className="text-xl font-semibold">
            Attempt {attempt.data.item.attempt_number} - {attempt.data.item.student_name}
          </h2>
          <p className="mt-1 text-sm text-neutral-300">
            Status: {attempt.data.item.status}
          </p>
          <p className="mt-1 text-sm text-neutral-300">
            Started: {formatDate(attempt.data.item.started_at)}
          </p>
          <p className="mt-1 text-sm text-neutral-300">
            Submitted: {formatDate(attempt.data.item.submitted_at)}
          </p>
        </section>
      ) : null}

      {!unauthorized && attempt.data?.item ? (
        <section className="mt-6">
          <h3 className="text-lg font-semibold">Responses</h3>
          {responses.loading ? <LoadingPanel /> : null}
          {!responses.loading && responses.error ? (
            <ErrorPanel message={responses.error} onRetry={responses.refetch} />
          ) : null}
          {!responses.loading && !responses.error && responses.data && responses.data.items.length === 0 ? (
            <EmptyPanel message="No responses found for this attempt." />
          ) : null}
          {!responses.loading && !responses.error && responses.data && responses.data.items.length > 0 ? (
            <div className="mt-3 space-y-2">
              {responses.data.items.map((response) => (
                <Link
                  key={response.id}
                  to={`/classrooms/${parsedClassroomId}/assignment/${parsedAssignmentId}/attempt/${parsedAttemptId}/response/${response.id}`}
                  className="block rounded border border-neutral-800 bg-neutral-800 px-3 py-2 text-sm hover:border-neutral-700"
                >
                  <p className="font-medium">Node: {response.node_id}</p>
                  <p className="text-xs text-neutral-400">
                    Created: {formatDate(response.created_at)}
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

export default AttemptDetail;
