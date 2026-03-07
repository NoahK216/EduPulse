import { Link, useParams } from 'react-router-dom';

import { isUuid } from '../../lib/uuid';
import { useApiData } from '../../lib/useApiData';
import { EmptyPanel, ErrorPanel, LoadingPanel, UnauthorizedPanel } from '../ui/DataStatePanels';
import PageShell from '../ui/PageShell';
import type { ItemResponse, PublicClassroomMember } from '../../types/publicApi';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function ClassroomMemberDetail() {
  const { classroomId, userId } = useParams();
  const classroomIdValue = isUuid(classroomId) ? classroomId : null;
  const userIdValue = isUuid(userId) ? userId : null;
  const hasValidIds = classroomIdValue !== null && userIdValue !== null;

  const path = hasValidIds
    ? `/api/public/classroom-members/${classroomIdValue}/${userIdValue}`
    : null;
  const member = useApiData<ItemResponse<PublicClassroomMember>>(path);

  return (
    <PageShell title="Classroom Member" subtitle="Membership details">
      <div className="mb-4">
        <Link
          to={hasValidIds ? `/classrooms/${classroomIdValue}` : '/classrooms'}
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          Back
        </Link>
      </div>

      {!hasValidIds ? <ErrorPanel message="Invalid classrooms/user identifiers." /> : null}
      {hasValidIds && member.unauthorized ? <UnauthorizedPanel /> : null}
      {hasValidIds && !member.unauthorized && member.loading ? <LoadingPanel /> : null}
      {hasValidIds && !member.unauthorized && !member.loading && member.error ? (
        <ErrorPanel message={member.error} onRetry={member.refetch} />
      ) : null}

      {hasValidIds && !member.unauthorized && !member.loading && !member.error && !member.data ? (
        <EmptyPanel message="Classroom member not found." />
      ) : null}

      {hasValidIds && member.data?.item ? (
        <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
          <h2 className="text-xl font-semibold">{member.data.item.user_name}</h2>
          <p className="mt-1 text-sm text-neutral-300">{member.data.item.user_email}</p>
          <p className="mt-1 text-sm text-neutral-300">Role: {member.data.item.role}</p>
          <p className="mt-1 text-sm text-neutral-300">
            Classroom: {member.data.item.classroom_name}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Joined: {formatDate(member.data.item.created_at)}
          </p>
        </section>
      ) : null}
    </PageShell>
  );
}

export default ClassroomMemberDetail;
