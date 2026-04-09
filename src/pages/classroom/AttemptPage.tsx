import { Link, useParams } from 'react-router-dom';

import AttemptSummaryCard from './components/AttemptSummaryCard';
import ResponseList from './components/ResponseList';
import { useAttemptDetailData } from './hooks/useClassroomData';
import { DataGuard } from '../../components/data/DataGuard';
import PageShell from '../../components/layout/PageShell';

function AttemptPage() {
  const { classroomId, assignmentId, attemptId } = useParams();
  const detail = useAttemptDetailData(attemptId);

  return (
    <PageShell
      title="Attempt Details"
      subtitle={detail.attemptId ? `Attempt ID: ${detail.attemptId}` : 'Invalid attempt identifier'}
    >
      <div className="mb-4">
        <Link
          to={
            classroomId && assignmentId
              ? `/classrooms/${classroomId}/assignment/${assignmentId}`
              : '/classrooms'
          }
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          Back to assignment
        </Link>
      </div>

      <DataGuard state={detail.guard}>
        {detail.attempt && classroomId && assignmentId && detail.attemptId ? (
          <>
            <AttemptSummaryCard attempt={detail.attempt} />

            <section className="mt-6">
              <h3 className="text-lg font-semibold">Responses</h3>
              <DataGuard state={detail.responsesGuard}>
                <ResponseList
                  responses={detail.responses}
                  classroomId={classroomId}
                  assignmentId={assignmentId}
                  attemptId={detail.attemptId}
                />
              </DataGuard>
            </section>
          </>
        ) : null}
      </DataGuard>
    </PageShell>
  );
}

export default AttemptPage;
