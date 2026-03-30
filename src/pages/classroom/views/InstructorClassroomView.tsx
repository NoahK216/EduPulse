import { useState } from 'react';

import { useApiData } from '../../../lib/useApiData';
import type {
  PagedResponse,
  PublicAssignment,
  PublicAttempt,
  PublicClassroomMember,
} from '../../../types/publicApi';
import { ErrorPanel, LoadingPanel } from '../../ui/DataStatePanels';
import AssignScenarioModal from './AssignScenarioModal';
import InstructorAssignmentCard from './InstructorAssignmentCard';

type InstructorTab = 'assignments' | 'students';

function isPastAssignment(assignment: PublicAssignment, now: number) {
  if (assignment.close_at) {
    return new Date(assignment.close_at).getTime() < now;
  }

  if (assignment.due_at) {
    return new Date(assignment.due_at).getTime() < now;
  }

  return false;
}

function compareAssignments(a: PublicAssignment, b: PublicAssignment) {
  const left = a.due_at ? new Date(a.due_at).getTime() : Number.MAX_SAFE_INTEGER;
  const right = b.due_at ? new Date(b.due_at).getTime() : Number.MAX_SAFE_INTEGER;

  if (left === right) {
    return a.title.localeCompare(b.title);
  }

  return left - right;
}

function getAssignmentProgress(assignmentId: string, attempts: PublicAttempt[]) {
  const submittedStudentIds = new Set<string>();

  attempts.forEach((attempt) => {
    if (attempt.assignment_id !== assignmentId) return;
    if (attempt.status === 'submitted') {
      submittedStudentIds.add(attempt.student_user_id);
    }
  });

  return {
    completedCount: submittedStudentIds.size,
  };
}

function formatJoinDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type InstructorClassroomViewProps = {
  classroomId: string;
  members: PublicClassroomMember[];
};

function InstructorClassroomView({
  classroomId,
  members,
}: InstructorClassroomViewProps) {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<InstructorTab>('assignments');
  const assignments = useApiData<PagedResponse<PublicAssignment>>(
    `/api/public/assignments?classroomId=${classroomId}&pageSize=100`,
  );
  const attempts = useApiData<PagedResponse<PublicAttempt>>('/api/public/attempts?pageSize=100');

  const studentMembers = members
    .filter((member) => member.role === 'student')
    .sort((left, right) => left.user_name.localeCompare(right.user_name));
  const studentCount = studentMembers.length;
  const classroomAttempts = (attempts.data?.items ?? []).filter(
    (attempt) => attempt.classroom_id === classroomId,
  );
  const now = Date.now();
  const currentAssignments = (assignments.data?.items ?? [])
    .filter((assignment) => !isPastAssignment(assignment, now))
    .sort(compareAssignments);
  const pastAssignments = (assignments.data?.items ?? [])
    .filter((assignment) => isPastAssignment(assignment, now))
    .sort(compareAssignments);
  const summaryText = assignments.loading
    ? `${studentCount} students | loading assignments`
    : `${studentCount} students | ${currentAssignments.length} active assignments`;
  const hasAssignmentLoadError = Boolean(assignments.error || attempts.error);
  const isAssignmentDataLoading = assignments.loading || attempts.loading;

  return (
    <>
      <section className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/40">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              Instructor Dashboard
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
              className={`border-b-2 pb-3 text-sm font-semibold transition ${
                activeTab === 'assignments'
                  ? 'border-cyan-500 text-cyan-700 dark:text-cyan-300'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              Assignments
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`border-b-2 pb-3 text-sm font-semibold transition ${
                activeTab === 'students'
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
        <>
          {isAssignmentDataLoading ? <LoadingPanel /> : null}
          {!assignments.loading && assignments.error ? (
            <ErrorPanel message={assignments.error} onRetry={assignments.refetch} />
          ) : null}
          {!attempts.loading && attempts.error ? (
            <ErrorPanel message={attempts.error} onRetry={attempts.refetch} />
          ) : null}

          {!isAssignmentDataLoading &&
          !hasAssignmentLoadError &&
          currentAssignments.length > 0 ? (
            <section className="mt-6">
              <h3 className="text-lg font-semibold">Current Assignments</h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {currentAssignments.map((assignment) => {
                  const progress = getAssignmentProgress(assignment.id, classroomAttempts);

                  return (
                    <InstructorAssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      classroomId={classroomId}
                      completedCount={progress.completedCount}
                      studentCount={studentCount}
                    />
                  );
                })}
              </div>
            </section>
          ) : null}

          {!isAssignmentDataLoading &&
          !hasAssignmentLoadError &&
          pastAssignments.length > 0 ? (
            <section className="mt-8">
              <h3 className="text-lg font-semibold">Past Assignments</h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {pastAssignments.map((assignment) => {
                  const progress = getAssignmentProgress(assignment.id, classroomAttempts);

                  return (
                    <InstructorAssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      classroomId={classroomId}
                      completedCount={progress.completedCount}
                      studentCount={studentCount}
                    />
                  );
                })}
              </div>
            </section>
          ) : null}
        </>
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
          classroomId={classroomId}
          onAssigned={() => {
            assignments.refetch();
          }}
          onClose={() => setAssignModalOpen(false)}
        />
      ) : null}
    </>
  );
}

export default InstructorClassroomView;
