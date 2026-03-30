import { Link } from 'react-router-dom';

import { useApiData } from '../../../lib/useApiData';
import type {
  PagedResponse,
  PublicAssignment,
  PublicClassroom,
  PublicClassroomMember,
} from '../../../types/publicApi';
import { EmptyPanel, ErrorPanel, LoadingPanel } from '../../ui/DataStatePanels';

function formatDate(value: string | null) {
  if (!value) return 'No due date';
  return new Date(value).toLocaleString();
}

function compareAssignments(a: PublicAssignment, b: PublicAssignment) {
  const left = a.due_at ? new Date(a.due_at).getTime() : Number.MAX_SAFE_INTEGER;
  const right = b.due_at ? new Date(b.due_at).getTime() : Number.MAX_SAFE_INTEGER;

  if (left === right) {
    return a.title.localeCompare(b.title);
  }

  return left - right;
}

type StudentClassroomViewProps = {
  classroom: PublicClassroom;
  classroomId: string;
  members: PublicClassroomMember[];
};

function StudentClassroomView({
  classroom,
  classroomId,
  members,
}: StudentClassroomViewProps) {
  const assignments = useApiData<PagedResponse<PublicAssignment>>(
    `/api/public/assignments?classroomId=${classroomId}&pageSize=100`,
  );
  const instructors = members.filter((member) => member.role === 'instructor');

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/40">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          Student View
        </p>
        <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
          Code: {classroom.code ?? 'N/A'}
        </p>
        <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
          Instructors:{' '}
          {instructors.length > 0
            ? instructors.map((member) => member.user_name).join(', ')
            : classroom.created_by_name}
        </p>
      </section>

      <section>
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
          <div className="mt-4 space-y-3">
            {[...assignments.data.items].sort(compareAssignments).map((assignment) => (
              <Link
                key={assignment.id}
                to={`/classrooms/${classroomId}/assignment/${assignment.id}`}
                className="block rounded-xl border border-neutral-300 bg-white p-4 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950/40 dark:hover:border-neutral-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{assignment.title}</p>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                      {assignment.scenario_version_title} (v{assignment.scenario_version_number})
                    </p>
                  </div>
                  <div className="text-right text-sm text-neutral-500 dark:text-neutral-400">
                    Due
                    <p className="mt-1">{formatDate(assignment.due_at)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default StudentClassroomView;
