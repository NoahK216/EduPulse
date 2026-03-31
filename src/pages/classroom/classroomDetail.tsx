import { useParams } from 'react-router-dom';

import { useCurrentUser } from '../../lib/useCurrentUser';
import { isUuid } from '../../lib/uuid';
import { useApiData } from '../../lib/useApiData';
import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  UnauthorizedPanel,
} from '../ui/DataStatePanels';
import PageShell from '../ui/PageShell';
import type {
  ItemResponse,
  PagedResponse,
  PublicClassroom,
  PublicClassroomMember,
} from '../../types/publicApi';
import InstructorClassroomView from './views/InstructorClassroomView';
import StudentClassroomView from './views/StudentClassroomView';

function ClassroomDetail() {
  const { classroomId } = useParams();
  const classroomIdValue = isUuid(classroomId) ? classroomId : null;
  const hasValidId = classroomIdValue !== null;

  const classroomPath = hasValidId ? `/api/public/classrooms/${classroomIdValue}` : null;
  const membersPath = hasValidId
    ? `/api/public/classroom-members?classroomId=${classroomIdValue}&pageSize=100`
    : null;

  const currentUser = useCurrentUser();
  const classroom = useApiData<ItemResponse<PublicClassroom>>(classroomPath);
  const members = useApiData<PagedResponse<PublicClassroomMember>>(membersPath);

  if (!hasValidId) {
    return (
      <PageShell title="Classroom" subtitle="Invalid classroom identifier">
        <ErrorPanel message="The classroom ID in the URL is invalid." />
      </PageShell>
    );
  }

  const unauthorized =
    currentUser.unauthorized || classroom.unauthorized || members.unauthorized;
  const isLoading = currentUser.loading || classroom.loading || members.loading;
  const pageError = currentUser.error || classroom.error || members.error;
  const classroomItem = classroom.data?.item;
  const publicUser = currentUser.user;
  const memberItems = members.data?.items ?? [];
  const currentMembership =
    publicUser === null
      ? null
      : memberItems.find((member) => member.user_id === publicUser.id) ?? null;
  const currentRole =
    currentMembership?.role ??
    (publicUser && classroomItem?.created_by_id === publicUser.id ? 'instructor' : null);

  return (
    <PageShell title={classroomItem?.name ?? 'Classroom'}>

      {unauthorized ? <UnauthorizedPanel /> : null}
      {!unauthorized && isLoading ? <LoadingPanel /> : null}
      {!unauthorized && !isLoading && pageError ? (
        <ErrorPanel
          message={pageError}
          onRetry={() => {
            currentUser.refetch();
            classroom.refetch();
            members.refetch();
          }}
        />
      ) : null}
      {!unauthorized && !isLoading && !pageError && !classroomItem ? (
        <EmptyPanel message="Classroom not found." />
      ) : null}
      {!unauthorized && !isLoading && !pageError && classroomItem && !publicUser ? (
        <EmptyPanel message="Your profile is not available yet." />
      ) : null}
      {!unauthorized &&
        !isLoading &&
        !pageError &&
        classroomItem &&
        publicUser &&
        currentRole === null ? (
        <ErrorPanel message="We couldn't determine your role in this classroom." />
      ) : null}

      {!unauthorized &&
        !isLoading &&
        !pageError &&
        classroomItem &&
        publicUser &&
        currentRole === 'instructor' ? (
        <InstructorClassroomView classroomId={classroomIdValue} members={memberItems} />
      ) : null}

      {!unauthorized &&
        !isLoading &&
        !pageError &&
        classroomItem &&
        publicUser &&
        currentRole === 'student' ? (
        <StudentClassroomView
          classroom={classroomItem}
          classroomId={classroomIdValue}
          members={memberItems}
        />
      ) : null}
    </PageShell>
  );
}

export default ClassroomDetail;
