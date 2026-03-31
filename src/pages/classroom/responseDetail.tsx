import { Link, useParams } from 'react-router-dom';

import ResponseDetailCard from './components/ResponseDetailCard';
import { useResponseDetailData } from './hooks/useClassroomData';
import { DataGuard } from '../ui/DataGuard';
import PageShell from '../ui/PageShell';

function ResponseDetail() {
  const { classroomId, assignmentId, attemptId, responseId } = useParams();
  const detail = useResponseDetailData(classroomId, assignmentId, attemptId, responseId);

  return (
    <PageShell
      title="Response Details"
      subtitle={
        detail.responseId ? `Response ID: ${detail.responseId}` : 'Invalid response identifier'
      }
    >
      <div className="mb-4">
        <Link
          to={
            detail.classroomId && detail.assignmentId && detail.attemptId
              ? `/classrooms/${detail.classroomId}/assignment/${detail.assignmentId}/attempt/${detail.attemptId}`
              : '/classrooms'
          }
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          Back
        </Link>
      </div>

      <DataGuard state={detail.guard}>
        {detail.response ? <ResponseDetailCard response={detail.response} /> : null}
      </DataGuard>
    </PageShell>
  );
}

export default ResponseDetail;
