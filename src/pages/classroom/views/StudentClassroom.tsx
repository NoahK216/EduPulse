import { Link } from 'react-router-dom';

import type {
  PublicClassroom,
  PublicClassroomMember,
} from '../../../types/publicApi';
import {
  DataGuard,
} from '../../../components/data/DataGuard';
import { stringFromDateOrText } from '../../../lib/format-dates';
import { useStudentClassroomData } from '../hooks/useClassroomData';

type StudentClassroomProps = {
  classroom: PublicClassroom;
  classroomMembers: PublicClassroomMember[];
};

function StudentClassroom({
  classroom,
  classroomMembers,
}: StudentClassroomProps) {
  const data = useStudentClassroomData(classroom.id);
  const instructors = classroomMembers.filter(
    (member) => member.role === "instructor",
  );

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
          Instructors:{' '}{instructors.map((member) => member.user_name).join(', ')}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold">Assignments</h3>
        <DataGuard state={data.assignmentsGuard}>
          <div className="mt-4 space-y-3">
            {data.assignments.map((assignment) => (
              <Link
                key={assignment.id}
                to={`/classrooms/${classroom.id}/assignment/${assignment.id}`}
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
                    <p className="mt-1">{stringFromDateOrText(assignment.due_at, "No due date")}</p>
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
