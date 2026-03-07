import { Link, useParams } from 'react-router-dom';

import { isUuid } from '../../lib/uuid';
import { useApiData } from '../../lib/useApiData';
import { EmptyPanel, ErrorPanel, LoadingPanel, UnauthorizedPanel } from '../ui/DataStatePanels';
import PageShell from '../ui/PageShell';
import type { ItemResponse, PagedResponse, PublicAssignment, PublicAttempt } from '../../types/publicApi';

function formatDate(value: string | null) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
}

function AssignmentDetail() {
  const { classroomId, assignmentId } = useParams();
  const classroomIdValue = isUuid(classroomId) ? classroomId : null;
  const assignmentIdValue = isUuid(assignmentId) ? assignmentId : null;
  const hasValidIds = classroomIdValue !== null && assignmentIdValue !== null;

  const assignmentPath = hasValidIds ? `/api/public/assignments/${assignmentIdValue}` : null;
  const attemptsPath = hasValidIds
    ? `/api/public/attempts?assignmentId=${assignmentIdValue}`
    : null;

  const assignment = useApiData<ItemResponse<PublicAssignment>>(assignmentPath);
  const attempts = useApiData<PagedResponse<PublicAttempt>>(attemptsPath);

  if (!hasValidIds) {
    return (
      <PageShell title="Assignment" subtitle="Invalid assignment identifier">
        <ErrorPanel message="The classroom or assignment ID in the URL is invalid." />
      </PageShell>
    );
  }

  const unauthorized = assignment.unauthorized || attempts.unauthorized;

  return (
    <PageShell title="Assignment Details" subtitle={`Assignment ID: ${assignmentIdValue}`}>
      <div className="mb-4">
        <Link
          to={`/classrooms/${classroomIdValue}`}
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          Back to classroom
        </Link>
      </div>

      {unauthorized ? <UnauthorizedPanel /> : null}
      {!unauthorized && assignment.loading ? <LoadingPanel /> : null}
      {!unauthorized && !assignment.loading && assignment.error ? (
        <ErrorPanel message={assignment.error} onRetry={assignment.refetch} />
      ) : null}
      {!unauthorized && !assignment.loading && !assignment.error && !assignment.data ? (
        <EmptyPanel message="Assignment not found." />
      ) : null}

      {!unauthorized && assignment.data?.item ? (
        <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
          <h2 className="text-xl font-semibold">{assignment.data.item.title}</h2>
          <p className="mt-1 text-sm text-neutral-300">
            Scenario version: {assignment.data.item.scenario_version_title} (v
            {assignment.data.item.scenario_version_number})
          </p>
          <p className="mt-1 text-sm text-neutral-300">
            Assigned by: {assignment.data.item.assigned_by_name}
          </p>
          <p className="mt-1 text-sm text-neutral-300">
            Due: {formatDate(assignment.data.item.due_at)}
          </p>
          <p className="mt-1 text-sm text-neutral-300">
            Max attempts: {assignment.data.item.max_attempts}
          </p>
          {assignment.data.item.instructions ? (
            <p className="mt-3 text-sm text-neutral-200">{assignment.data.item.instructions}</p>
          ) : null}
        </section>
      ) : null}

      {!unauthorized && assignment.data?.item ? (
        <section className="mt-6">
          <h3 className="text-lg font-semibold">Attempts</h3>
          {attempts.loading ? <LoadingPanel /> : null}
          {!attempts.loading && attempts.error ? (
            <ErrorPanel message={attempts.error} onRetry={attempts.refetch} />
          ) : null}
          {!attempts.loading && !attempts.error && attempts.data && attempts.data.items.length === 0 ? (
            <EmptyPanel message="No attempts found for this assignment." />
          ) : null}
          {!attempts.loading && !attempts.error && attempts.data && attempts.data.items.length > 0 ? (
            <div className="mt-3 space-y-2">
              {attempts.data.items.map((attempt) => (
                <Link
                  key={attempt.id}
                  to={`/classrooms/${classroomIdValue}/assignment/${assignmentIdValue}/attempt/${attempt.id}`}
                  className="block rounded border border-neutral-800 bg-neutral-800 px-3 py-2 text-sm hover:border-neutral-700"
                >
                  <p className="font-medium">
                    Attempt {attempt.attempt_number} - {attempt.student_name}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Status: {attempt.status} | Started: {formatDate(attempt.started_at)}
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

export default AssignmentDetail;
