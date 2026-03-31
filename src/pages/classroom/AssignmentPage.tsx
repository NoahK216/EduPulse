import { Link, useParams } from 'react-router-dom';

import AttemptList from './components/AttemptList';
import AssignmentSummaryCard from './components/AssignmentSummaryCard';
import StudentProgressCard from './components/StudentProgressCard';
import { useAssignmentDetailData } from './hooks/useClassroomData';
import { DataGuard } from '../../components/data/DataGuard';
import PageShell from '../../components/layout/PageShell';

function AssignmentPage() {
  const { classroomId, assignmentId } = useParams();
  const detail = useAssignmentDetailData(classroomId, assignmentId);

  return (
    <PageShell
      title={detail.assignment?.title ?? 'Assignment'}
      subtitle={detail.guard.kind === 'invalid' ? 'Invalid assignment identifier' : undefined}
    >
      <div className="mb-4">
        <Link
          to={detail.classroomId ? `/classrooms/${detail.classroomId}` : '/classrooms'}
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          Back to classroom
        </Link>
      </div>

      <DataGuard state={detail.guard}>
        {detail.assignment && detail.classroomId && detail.assignmentId && detail.role ? (
          <div className="space-y-6">
            <AssignmentSummaryCard assignment={detail.assignment} />

            {detail.role === 'student' ? (
              <StudentProgressCard
                attemptsUsed={detail.attemptsUsed}
                attemptsRemaining={detail.attemptsRemaining}
                isOpen={detail.isOpen}
                isClosed={detail.isClosed}
                openAt={detail.assignment.open_at}
                closeAt={detail.assignment.close_at}
                hasRunnableAttempt={detail.hasRunnableAttempt}
                inProgressAttemptNumber={detail.inProgressAttempt?.attempt_number ?? null}
                canStartNewAttempt={detail.canStartNewAttempt}
                runnerLink={detail.runnerLink}
              />
            ) : null}

            <section className="mt-6">
              <h3 className="text-lg font-semibold">
                {detail.role === 'student' ? 'Your Attempts' : 'Attempts'}
              </h3>
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
          </div>
        ) : null}
      </DataGuard>
    </PageShell>
  );
}

export default AssignmentPage;
