import { Link, useParams } from 'react-router-dom';

import ClassroomMemberCard from './components/ClassroomMemberCard';
import { useClassroomMemberDetailData } from './hooks/useClassroomData';
import { DataGuard } from '../ui/DataGuard';
import PageShell from '../ui/PageShell';

function ClassroomMemberDetail() {
  const { classroomId, userId } = useParams();
  const detail = useClassroomMemberDetailData(classroomId, userId);

  return (
    <PageShell title="Classroom Member" subtitle="Membership details">
      <div className="mb-4">
        <Link
          to={classroomId ? `/classrooms/${classroomId}` : '/classrooms'}
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          Back
        </Link>
      </div>

      <DataGuard state={detail.guard}>
        {detail.member ? <ClassroomMemberCard member={detail.member} /> : null}
      </DataGuard>
    </PageShell>
  );
}

export default ClassroomMemberDetail;
