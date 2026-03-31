import { Link } from 'react-router-dom';

import type { PublicAssignment } from '../../../types/publicApi';

function formatDueDate(value: string | null) {
  if (!value) return 'No due date';

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

type InstructorAssignmentCardProps = {
  assignment: PublicAssignment;
  classroomId: string;
  completedCount: number;
  studentCount: number;
};

function InstructorAssignmentCard({
  assignment,
  classroomId,
  completedCount,
  studentCount,
}: InstructorAssignmentCardProps) {
  const progressPercent =
    studentCount === 0 ? 0 : Math.round((completedCount / studentCount) * 100);

  return (
    <article className="rounded-2xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/40">
      <div>
        <h3 className="text-lg font-semibold">{assignment.title}</h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Due: {formatDueDate(assignment.due_at)}
        </p>
      </div>

      <div className="mt-6">
        <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          {completedCount}/{studentCount} completed
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to={`/classrooms/${classroomId}/assignment/${assignment.id}`}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          View Submissions
        </Link>
        <button
          type="button"
          disabled
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-400 dark:border-neutral-800 dark:text-neutral-500"
        >
          Edit Assignment
        </button>
      </div>
    </article>
  );
}

export default InstructorAssignmentCard;
