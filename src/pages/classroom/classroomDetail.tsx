import { Link, useParams } from 'react-router-dom';

import { isUuid } from '../../lib/uuid';
import { useApiData } from '../../lib/useApiData';
import { EmptyPanel, ErrorPanel, LoadingPanel, UnauthorizedPanel } from '../ui/DataStatePanels';
import PageShell from '../ui/PageShell';
import type {
  ItemResponse,
  PagedResponse,
  PublicAssignment,
  PublicClassroom,
  PublicClassroomMember,
} from '../../types/publicApi';

function formatDate(value: string | null) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
}

function ClassroomDetail() {
  const { classroomId } = useParams();
  const classroomIdValue = isUuid(classroomId) ? classroomId : null;
  const hasValidId = classroomIdValue !== null;

  const classroomPath = hasValidId ? `/api/public/classrooms/${classroomIdValue}` : null;
  const membersPath = hasValidId
    ? `/api/public/classroom-members?classroomId=${classroomIdValue}`
    : null;
  const assignmentsPath = hasValidId
    ? `/api/public/assignments?classroomId=${classroomIdValue}`
    : null;

  const classroom = useApiData<ItemResponse<PublicClassroom>>(classroomPath);
  const members = useApiData<PagedResponse<PublicClassroomMember>>(membersPath);
  const assignments = useApiData<PagedResponse<PublicAssignment>>(assignmentsPath);

  if (!hasValidId) {
    return (
      <PageShell title="Classroom" subtitle="Invalid classroom identifier">
        <ErrorPanel message="The classroom ID in the URL is invalid." />
      </PageShell>
    );
  }

  const unauthorized =
    classroom.unauthorized || members.unauthorized || assignments.unauthorized;
  const isLoading = classroom.loading;
  const classroomError = classroom.error;
  const classroomItem = classroom.data?.item;

  return (
    <PageShell title="Classroom Details" subtitle={`Classroom ID: ${classroomIdValue}`}>
      <div className="mb-4">
        <Link to="/classrooms" className="text-sm text-blue-300 hover:text-blue-200">
          Back to classrooms
        </Link>
      </div>

      {unauthorized ? <UnauthorizedPanel /> : null}
      {!unauthorized && isLoading ? <LoadingPanel /> : null}
      {!unauthorized && !isLoading && classroomError ? (
        <ErrorPanel message={classroomError} onRetry={classroom.refetch} />
      ) : null}
      {!unauthorized && !isLoading && !classroomError && !classroomItem ? (
        <EmptyPanel message="Classroom not found." />
      ) : null}

      {!unauthorized && classroomItem ? (
        <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
          <h2 className="text-xl font-semibold">{classroomItem.name}</h2>
          <p className="mt-1 text-sm text-neutral-300">Code: {classroomItem.code ?? 'N/A'}</p>
          <p className="mt-1 text-sm text-neutral-300">
            Created by {classroomItem.created_by_name}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Created: {formatDate(classroomItem.created_at)}
          </p>
        </section>
      ) : null}

      {!unauthorized && classroomItem ? (
        <section className="mt-6">
          <h3 className="text-lg font-semibold">Members</h3>
          {members.loading ? <LoadingPanel /> : null}
          {!members.loading && members.error ? (
            <ErrorPanel message={members.error} onRetry={members.refetch} />
          ) : null}
          {!members.loading && !members.error && members.data && members.data.items.length === 0 ? (
            <EmptyPanel message="No members found for this classroom." />
          ) : null}
          {!members.loading && !members.error && members.data && members.data.items.length > 0 ? (
            <div className="mt-3 space-y-2">
              {members.data.items.map((member) => (
                <Link
                  key={`${member.classroom_id}-${member.user_id}`}
                  to={`/classrooms/${classroomIdValue}/member/${member.user_id}`}
                  className="block rounded border border-neutral-800 bg-neutral-800 px-3 py-2 text-sm hover:border-neutral-700"
                >
                  {member.user_name} ({member.role})
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {!unauthorized && classroomItem ? (
        <section className="mt-6">
          <h3 className="text-lg font-semibold">Assignments</h3>
          {assignments.loading ? <LoadingPanel /> : null}
          {!assignments.loading && assignments.error ? (
            <ErrorPanel message={assignments.error} onRetry={assignments.refetch} />
          ) : null}
          {!assignments.loading &&
          !assignments.error &&
          assignments.data &&
          assignments.data.items.length === 0 ? (
            <EmptyPanel message="No assignments found for this classroom." />
          ) : null}
          {!assignments.loading &&
          !assignments.error &&
          assignments.data &&
          assignments.data.items.length > 0 ? (
            <div className="mt-3 space-y-2">
              {assignments.data.items.map((assignment) => (
                <Link
                  key={assignment.id}
                  to={`/classrooms/${classroomIdValue}/assignment/${assignment.id}`}
                  className="block rounded border border-neutral-800 bg-neutral-800 px-3 py-2 text-sm hover:border-neutral-700"
                >
                  <p className="font-medium">{assignment.title}</p>
                  <p className="text-xs text-neutral-400">Due: {formatDate(assignment.due_at)}</p>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </PageShell>
  );
}

export default ClassroomDetail;
