import { Link } from 'react-router-dom';

import type {
  PublicAssignment,
  PublicClassroom,
  PublicClassroomMember,
} from '../../../types/publicApi';
import {
  DataGuard,
  type DataGuardState,
} from '../../../components/data/DataGuard';

function formatDate(value: string | null) {
  if (!value) return 'No due date';
  return new Date(value).toLocaleString();
}

type StudentClassroomProps = {
  classroom: PublicClassroom;
  classroomId: string;
  instructors: PublicClassroomMember[];
  assignments: PublicAssignment[];
  assignmentsGuard: DataGuardState;
};

function StudentClassroom({
  classroom,
  classroomId,
  instructors,
  assignments,
  assignmentsGuard,
}: StudentClassroomProps) {
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
        <DataGuard state={assignmentsGuard}>
          <div className="mt-4 space-y-3">
            {assignments.map((assignment) => (
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
        </DataGuard>
      </section>
    </div>
  );
}

export default StudentClassroom;
