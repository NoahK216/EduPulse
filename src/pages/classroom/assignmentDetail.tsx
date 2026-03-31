import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useCurrentUser } from '../../lib/useCurrentUser';
import { isUuid } from '../../lib/uuid';
import { useApiData } from '../../lib/useApiData';
import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  UnauthorizedPanel,
} from '../ui/DataStatePanels';
import PageShell from '../ui/PageShell';
import type {
  ItemResponse,
  PagedResponse,
  PublicAssignment,
  PublicAttempt,
  PublicClassroomMember,
} from '../../types/publicApi';

function formatDate(value: string | null) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
}

function compareAttempts(a: PublicAttempt, b: PublicAttempt) {
  return b.attempt_number - a.attempt_number;
}

function AssignmentDetail() {
  const { classroomId, assignmentId } = useParams();
  const [pageLoadedAt] = useState(() => Date.now());
  const classroomIdValue = isUuid(classroomId) ? classroomId : null;
  const assignmentIdValue = isUuid(assignmentId) ? assignmentId : null;
  const hasValidIds = classroomIdValue !== null && assignmentIdValue !== null;

  const assignmentPath = hasValidIds ? `/api/public/assignments/${assignmentIdValue}` : null;
  const attemptsPath = hasValidIds
    ? `/api/public/attempts?assignmentId=${assignmentIdValue}`
    : null;
  const membersPath = hasValidIds
    ? `/api/public/classroom-members?classroomId=${classroomIdValue}&pageSize=100`
    : null;

  const assignment = useApiData<ItemResponse<PublicAssignment>>(assignmentPath);
  const attempts = useApiData<PagedResponse<PublicAttempt>>(attemptsPath);
  const currentUser = useCurrentUser();
  const members = useApiData<PagedResponse<PublicClassroomMember>>(membersPath);

  if (!hasValidIds) {
    return (
      <PageShell title="Assignment" subtitle="Invalid assignment identifier">
        <ErrorPanel message="The classroom or assignment ID in the URL is invalid." />
      </PageShell>
    );
  }

  const unauthorized =
    assignment.unauthorized ||
    attempts.unauthorized ||
    currentUser.unauthorized ||
    members.unauthorized;
  const identityLoading = currentUser.loading || members.loading;
  const identityError = currentUser.error || members.error;
  const assignmentItem = assignment.data?.item ?? null;
  const publicUser = currentUser.user;
  const memberItems = members.data?.items ?? [];

  const currentMembership =
    publicUser === null
      ? null
      : memberItems.find((member) => member.user_id === publicUser.id) ?? null;
  const currentRole =
    currentMembership?.role ?? null;

  const attemptItems = [...(attempts.data?.items ?? [])].sort(compareAttempts);
  const latestAttempt = attemptItems[0] ?? null;
  const inProgressAttempt =
    attemptItems.find((attemptItem) => attemptItem.status === 'in_progress') ?? null;
  const isOpen =
    !assignmentItem?.open_at ||
    new Date(assignmentItem.open_at).getTime() <= pageLoadedAt;
  const isClosed =
    Boolean(assignmentItem?.close_at) &&
    new Date(assignmentItem?.close_at as string).getTime() <= pageLoadedAt;
  const attemptsUsed = attemptItems.length;
  const attemptsRemaining =
    assignmentItem?.max_attempts === null || typeof assignmentItem?.max_attempts === 'undefined'
      ? null
      : Math.max(assignmentItem.max_attempts - attemptsUsed, 0);
  const hasRunnableAttempt = Boolean(inProgressAttempt) && !isClosed && isOpen;
  const canStartNewAttempt =
    currentRole === 'student' &&
    !hasRunnableAttempt &&
    !isClosed &&
    isOpen &&
    (assignmentItem?.max_attempts === null ||
      typeof assignmentItem?.max_attempts === 'undefined' ||
      attemptsUsed < assignmentItem.max_attempts);
  const runnerLink = `/classrooms/${classroomIdValue}/assignment/${assignmentIdValue}/attempt`;

  return (
    <PageShell title={assignmentItem?.title ?? 'Assignment'}>
      <div className="mb-4">
        <Link
          to={`/classrooms/${classroomIdValue}`}
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          Back to classroom
        </Link>
      </div>

      {unauthorized ? <UnauthorizedPanel /> : null}
      {!unauthorized && identityLoading ? <LoadingPanel /> : null}
      {!unauthorized && !identityLoading && identityError ? (
        <ErrorPanel
          message={identityError}
          onRetry={() => {
            currentUser.refetch();
            members.refetch();
          }}
        />
      ) : null}
      {!unauthorized && !identityLoading && !identityError && assignment.loading ? (
        <LoadingPanel />
      ) : null}
      {!unauthorized && !identityLoading && !identityError && !assignment.loading && assignment.error ? (
        <ErrorPanel message={assignment.error} onRetry={assignment.refetch} />
      ) : null}
      {!unauthorized &&
        !identityLoading &&
        !identityError &&
        !assignment.loading &&
        !assignment.error &&
        !assignmentItem ? (
        <EmptyPanel message="Assignment not found." />
      ) : null}
      {!unauthorized &&
        !identityLoading &&
        !identityError &&
        assignmentItem &&
        !publicUser ? (
        <EmptyPanel message="Your profile is not available yet." />
      ) : null}
      {!unauthorized &&
        !identityLoading &&
        !identityError &&
        assignmentItem &&
        publicUser &&
        currentRole === null ? (
        <ErrorPanel message="We couldn't determine your role for this assignment." />
      ) : null}

      {!unauthorized &&
        !identityLoading &&
        !identityError &&
        assignmentItem &&
        publicUser &&
        currentRole !== null ? (
        <div className="space-y-6">
          <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
              <h2 className="text-xl font-semibold">{assignmentItem.title}</h2>
              <p className="mt-1 text-sm text-neutral-300">
                Scenario version: {assignmentItem.scenario_version_title} (v
                {assignmentItem.scenario_version_number})
              </p>
              <p className="mt-1 text-sm text-neutral-300">
                Assigned by: {assignmentItem.assigned_by_name}
              </p>
              <p className="mt-1 text-sm text-neutral-300">
                Opens: {formatDate(assignmentItem.open_at)}
              </p>
              <p className="mt-1 text-sm text-neutral-300">
                Due: {formatDate(assignmentItem.due_at)}
              </p>
              <p className="mt-1 text-sm text-neutral-300">
                Closes: {formatDate(assignmentItem.close_at)}
              </p>
              <p className="mt-1 text-sm text-neutral-300">
                Max attempts:{' '}
                {assignmentItem.max_attempts === null ? 'Unlimited' : assignmentItem.max_attempts}
              </p>
              {assignmentItem.instructions ? (
                <p className="mt-3 text-sm text-neutral-200">{assignmentItem.instructions}</p>
              ) : null}
            </section>

            {currentRole === 'student' ? (
              <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Your Progress</h3>
                    <p className="mt-2 text-sm text-neutral-300">
                      Attempts used: {attemptsUsed}
                      {attemptsRemaining !== null ? ` | Remaining: ${attemptsRemaining}` : ''}
                    </p>
                    {!isOpen && assignmentItem.open_at ? (
                      <p className="mt-2 text-sm text-neutral-400">
                        This assignment opens on {formatDate(assignmentItem.open_at)}.
                      </p>
                    ) : null}
                    {isClosed ? (
                      <p className="mt-2 text-sm text-neutral-400">
                        This assignment closed on {formatDate(assignmentItem.close_at)}.
                      </p>
                    ) : null}
                    {isOpen && !isClosed && hasRunnableAttempt ? (
                      <p className="mt-2 text-sm text-neutral-400">
                        Resume attempt {inProgressAttempt?.attempt_number} where you left off.
                      </p>
                    ) : null}
                    {isOpen && !isClosed && !hasRunnableAttempt && !canStartNewAttempt ? (
                      <p className="mt-2 text-sm text-neutral-400">
                        You have used all available attempts for this assignment.
                      </p>
                    ) : null}
                  </div>

                  {hasRunnableAttempt || canStartNewAttempt ? (
                    <Link
                      to={runnerLink}
                      className="inline-flex rounded-md border border-neutral-300 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:border-neutral-700"
                    >
                      {hasRunnableAttempt ? 'Continue Attempt' : 'Start Attempt'}
                    </Link>
                  ) : null}
                </div>
              </section>
            ) : null}

            <section className="mt-6">
              <h3 className="text-lg font-semibold">
                {currentRole === 'student' ? 'Your Attempts' : 'Attempts'}
              </h3>
              {attempts.loading ? <LoadingPanel /> : null}
              {!attempts.loading && attempts.error ? (
                <ErrorPanel message={attempts.error} onRetry={attempts.refetch} />
              ) : null}
              {!attempts.loading && !attempts.error && attemptItems.length === 0 ? (
                <EmptyPanel
                  message={
                    currentRole === 'student'
                      ? 'You have not started this assignment yet.'
                      : 'No attempts found for this assignment.'
                  }
                />
              ) : null}
              {!attempts.loading && !attempts.error && attemptItems.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {attemptItems.map((attemptItem) => (
                    <Link
                    key={attemptItem.id}
                    to={`/classrooms/${classroomIdValue}/assignment/${assignmentIdValue}/attempt/${attemptItem.id}`}
                    className="block rounded border border-neutral-800 bg-neutral-800 px-3 py-2 text-sm hover:border-neutral-700"
                  >
                    <p className="font-medium">
                      Attempt {attemptItem.attempt_number}
                      {currentRole === 'instructor' ? ` - ${attemptItem.student_name}` : ''}
                    </p>
                    <p className="text-xs text-neutral-400">
                      Status: {attemptItem.status} | Last saved:{' '}
                      {formatDate(attemptItem.last_activity_at)}
                    </p>
                    {latestAttempt?.id === attemptItem.id && currentRole === 'student' ? (
                      <p className="mt-1 text-xs text-neutral-500">Latest attempt</p>
                    ) : null}
                  </Link>
                ))}
                </div>
              ) : null}
            </section>
          </div>
      ) : null}
    </PageShell>
  );
}

export default AssignmentDetail;
