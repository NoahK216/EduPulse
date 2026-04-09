import { useState } from 'react';

import type {
  PublicClassroom,
  PublicClassroomMember,
} from '../../../types/publicApi';
import {
  DataGuard,
} from '../../../components/data/DataGuard';
import InstructorAssignmentCard from '../components/InstructorAssignmentCard';
import AssignScenarioModal from '../components/AssignScenarioModal';
import { useInstructorClassroomData } from '../hooks/useClassroomData';

type InstructorTab = 'assignments' | 'students';

function formatJoinDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type InstructorClassroomProps = {
  classroom: PublicClassroom;
  classroomMembers: PublicClassroomMember[];
};

function InstructorClassroom({
  classroom,
  classroomMembers,
}: InstructorClassroomProps) {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<InstructorTab>('assignments');
  const data = useInstructorClassroomData(classroom.id);
  const studentMembers = classroomMembers.filter(
    (member) => member.role === "student",
  );
  const summaryText =
    data.assignmentsGuard.kind === "loading"
      ? `${studentMembers.length} students | loading assignments`
      : `${studentMembers.length} students | ${data.currentAssignments.length} active assignments`;

  return (
    <>
      <section className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/40">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              Instructor Dashboard
            </p>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              Join code: {classroom.code ?? 'N/A'}
            </p>
            <p className="mt-2 text-lg text-neutral-700 dark:text-neutral-300">
              {summaryText}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAssignModalOpen(true)}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
          >
            + Assign Scenario
          </button>
        </div>

        <div className="mt-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className={`border-b-2 pb-3 text-sm font-semibold transition ${activeTab === 'assignments'
                  ? 'border-cyan-500 text-cyan-700 dark:text-cyan-300'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
            >
              Assignments
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`border-b-2 pb-3 text-sm font-semibold transition ${activeTab === 'students'
                  ? 'border-cyan-500 text-cyan-700 dark:text-cyan-300'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
            >
              Students
            </button>
          </div>
        </div>
      </section>

      {activeTab === 'assignments' ? (
        <DataGuard state={data.assignmentsGuard}>
          <>
            {data.currentAssignments.length > 0 ? (
              <section className="mt-6">
                <h3 className="text-lg font-semibold">Current Assignments</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {data.currentAssignments.map(({ assignment, completedCount }) => (
                    <InstructorAssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      classroomId={classroom.id}
                      completedCount={completedCount}
                      studentCount={studentMembers.length}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {data.pastAssignments.length > 0 ? (
              <section className="mt-8">
                <h3 className="text-lg font-semibold">Past Assignments</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {data.pastAssignments.map(({ assignment, completedCount }) => (
                    <InstructorAssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      classroomId={classroom.id}
                      completedCount={completedCount}
                      studentCount={studentMembers.length}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        </DataGuard>
      ) : null}

      {activeTab === 'students' ? (
        <section className="mt-6 rounded-2xl border border-neutral-300 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950/40">
          {studentMembers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                <thead className="bg-neutral-50 dark:bg-neutral-900/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {studentMembers.map((student) => (
                    <tr key={student.user_id}>
                      <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {student.user_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">
                        {formatJoinDate(student.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-6 text-sm text-neutral-600 dark:text-neutral-300">
              No students have joined this classroom yet.
            </div>
          )}
        </section>
      ) : null}

      {assignModalOpen ? (
        <AssignScenarioModal
          classroomId={classroom.id}
          onAssigned={data.refetch}
          onClose={() => setAssignModalOpen(false)}
        />
      ) : null}
    </>
  );
}

export default InstructorClassroom;
