import { Link, useParams } from "react-router-dom";

import AttemptList from "./components/AttemptList";
import InstructorAttemptRoster from "./components/InstructorAttemptRoster";
import AssignmentSummaryCard from "./components/AssignmentSummaryCard";
import StudentProgressCard from "./components/StudentProgressCard";
import { useAssignmentDetailData } from "./hooks/useClassroomData";
import { DataGuard } from "../../components/data/DataGuard";
import PageShell from "../../components/layout/PageShell";

function AssignmentPage() {
  const { classroomId, assignmentId } = useParams();
  const detail = useAssignmentDetailData(classroomId, assignmentId);

  return (
    <PageShell
      title={detail.assignment?.title ?? "Assignment"}
      subtitle={
        detail.guard.kind === "invalid"
          ? "Invalid assignment identifier"
          : undefined
      }
    >
      <div className="mb-4">
        <Link
          to={
            detail.classroomId
              ? `/classrooms/${detail.classroomId}`
              : "/classrooms"
          }
          className="text-sm text-cyan-700 transition hover:text-cyan-500 dark:text-cyan-200 dark:hover:text-cyan-100"
        >
          Back to classroom
        </Link>
      </div>

      <DataGuard state={detail.guard}>
        {detail.assignment &&
        detail.classroomId &&
        detail.assignmentId &&
        detail.role ? (
          <div className="space-y-6">
            <AssignmentSummaryCard assignment={detail.assignment} />

            {detail.role === "instructor" ? (
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/classrooms/${detail.classroomId}/assignment/${detail.assignmentId}/attempt`}
                  className="inline-flex rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                >
                  Test Assignment
                </Link>
              </div>
            ) : null}

            {detail.role === "student" ? (
              <StudentProgressCard
                attemptsUsed={detail.attemptsUsed}
                attemptsRemaining={detail.attemptsRemaining}
                isOpen={detail.isOpen}
                isClosed={detail.isClosed}
                openAt={detail.assignment.open_at}
                closeAt={detail.assignment.close_at}
                hasRunnableAttempt={detail.hasRunnableAttempt}
                inProgressAttemptNumber={
                  detail.inProgressAttempt?.attempt_number ?? null
                }
                canStartNewAttempt={detail.canStartNewAttempt}
                runnerLink={detail.runnerLink}
              />
            ) : null}

            {detail.role === "student" ? (
              <section className="mt-6">
                <h3 className="text-lg font-semibold">Your Attempts</h3>
                <DataGuard state={detail.attemptsGuard}>
                  <AttemptList
                    attempts={detail.attempts}
                    classroomId={detail.classroomId}
                    assignmentId={detail.assignmentId}
                    role={detail.role}
                    latestAttemptId={detail.latestAttempt?.id ?? null}
                  />
                </DataGuard>
              </section>
            ) : null}

            {detail.role === "instructor" ? (
              <section className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Student Attempts</h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                    Every student is listed below. The latest attempt is selected
                    by default when multiple attempts exist.
                  </p>
                </div>
                <DataGuard state={detail.submissionsGuard}>
                  <InstructorAttemptRoster
                    classroomId={detail.classroomId}
                    assignmentId={detail.assignmentId}
                    studentAttemptGroups={detail.studentAttemptGroups}
                  />
                </DataGuard>
              </section>
            ) : null}
          </div>
        ) : null}
      </DataGuard>
    </PageShell>
  );
}

export default AssignmentPage;
