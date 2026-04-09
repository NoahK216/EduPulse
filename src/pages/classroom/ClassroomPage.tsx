import { useParams } from 'react-router-dom';

import { DataGuard } from '../../components/data/DataGuard';
import PageShell from '../../components/layout/PageShell';
import { useClassroomPageData } from './hooks/useClassroomData';
import InstructorClassroom from './views/InstructorClassroom';
import StudentClassroom from './views/StudentClassroom';

function ClassroomPage() {
  const { classroomId } = useParams();
  const page = useClassroomPageData(classroomId);

  return (
    <PageShell
      title={page.classroom?.name ?? 'Classroom'}
      subtitle={page.guard.kind === 'invalid' ? 'Invalid classroom identifier' : undefined}
    >
      <DataGuard state={page.guard}>
        {page.classroom && page.classroom.viewer_role === 'instructor' ? (
          <InstructorClassroom
            classroom={page.classroom}
            classroomMembers={page.members}
          />
        ) : null}

        {page.classroom && page.classroom.viewer_role === 'student' ? (
          <StudentClassroom
            classroom={page.classroom}
            classroomMembers={page.members}
          />
        ) : null}
      </DataGuard>
    </PageShell>
  );
}

export default ClassroomPage;
