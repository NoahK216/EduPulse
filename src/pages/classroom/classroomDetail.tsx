import { useParams } from 'react-router-dom';

import { DataGuard } from '../ui/DataGuard';
import PageShell from '../ui/PageShell';
import { useClassroomViewer } from './hooks/useClassroomData';
import InstructorClassroomView from './views/InstructorClassroomView';
import StudentClassroomView from './views/StudentClassroomView';

function ClassroomDetail() {
  const { classroomId } = useParams();
  const viewer = useClassroomViewer(classroomId);

  return (
    <PageShell
      title={viewer.classroom?.name ?? 'Classroom'}
      subtitle={viewer.guard.kind === 'invalid' ? 'Invalid classroom identifier' : undefined}
    >
      <DataGuard state={viewer.guard}>
        {viewer.classroomId && viewer.classroom && viewer.role === 'instructor' ? (
          <InstructorClassroomView
            classroomId={viewer.classroomId}
            currentAssignments={viewer.instructorView.currentAssignments}
            pastAssignments={viewer.instructorView.pastAssignments}
            studentMembers={viewer.instructorView.studentMembers}
            studentCount={viewer.instructorView.studentCount}
            summaryText={viewer.instructorView.summaryText}
            assignmentsGuard={viewer.instructorView.assignmentsGuard}
            onAssignmentsChanged={viewer.instructorView.refetch}
          />
        ) : null}

        {viewer.classroomId && viewer.classroom && viewer.role === 'student' ? (
          <StudentClassroomView
            classroom={viewer.classroom}
            classroomId={viewer.classroomId}
            instructors={viewer.studentView.instructors}
            assignments={viewer.studentView.assignments}
            assignmentsGuard={viewer.studentView.assignmentsGuard}
          />
        ) : null}
      </DataGuard>
    </PageShell>
  );
}

export default ClassroomDetail;
