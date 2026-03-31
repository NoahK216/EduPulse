import { useState } from 'react';

import { authClient } from '../../../lib/auth-client';
import {
  useAssignments,
  useAttempts,
  useClassroomMemberships,
  useClassrooms,
  useCurrentUser,
} from '../../../lib/usePublicApiHooks';
import type {
  PublicAssignment,
  PublicAttempt,
  PublicClassroom,
} from '../../../types/publicApi';
import type { DataGuardState } from "../../../components/data/DataGuard";

type HomeDashboardData = {
  displayName: string;
  guard: DataGuardState;
  membershipsGuard: DataGuardState;
  attemptsGuard: DataGuardState;
  assignmentsGuard: DataGuardState;
  classroomsGuard: DataGuardState;
  inProgressAttempt: PublicAttempt | null;
  upcomingAssignments: PublicAssignment[];
  instructorClassrooms: PublicClassroom[];
  showStudentAssignments: boolean;
  showInstructorClassrooms: boolean;
  showEmptyState: boolean;
};

const CONTENT_GUARD: DataGuardState = { kind: 'content' };

function formatDisplayName(value: string | null | undefined) {
  if (!value) return 'there';

  const trimmed = value.trim();
  if (trimmed.length === 0) return 'there';

  if (trimmed.includes('@')) {
    return trimmed.split('@')[0];
  }

  return trimmed.split(/\s+/)[0];
}

function compareByDueDate(left: PublicAssignment, right: PublicAssignment) {
  if (!left.due_at && !right.due_at) return left.title.localeCompare(right.title);
  if (!left.due_at) return 1;
  if (!right.due_at) return -1;

  return new Date(left.due_at).getTime() - new Date(right.due_at).getTime();
}

function createGuard({
  unauthorized,
  loading,
  error,
  onRetry,
  itemCount,
  emptyMessage,
}: {
  unauthorized: boolean;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  itemCount?: number;
  emptyMessage?: string;
}): DataGuardState {
  if (unauthorized) {
    return { kind: 'unauthorized' };
  }

  if (loading) {
    return { kind: 'loading' };
  }

  if (error) {
    return {
      kind: 'error',
      message: error,
      onRetry,
    };
  }

  if (typeof itemCount === 'number' && emptyMessage && itemCount === 0) {
    return {
      kind: 'empty',
      message: emptyMessage,
    };
  }

  return CONTENT_GUARD;
}

export function useHomeDashboardData(): HomeDashboardData {
  const [pageLoadedAt] = useState(() => Date.now());
  const { data: session } = authClient.useSession();
  const currentUser = useCurrentUser();
  const classroomMembers = useClassroomMemberships();
  const assignments = useAssignments({ pageSize: 100 });
  const attempts = useAttempts({ pageSize: 100 });
  const classrooms = useClassrooms(100);
  const publicUser = currentUser.user;
  const displayName = formatDisplayName(
    publicUser?.name ?? session?.user?.name ?? session?.user?.email,
  );

  let guard: DataGuardState = CONTENT_GUARD;

  if (
    currentUser.unauthorized ||
    classroomMembers.unauthorized ||
    assignments.unauthorized ||
    attempts.unauthorized ||
    classrooms.unauthorized
  ) {
    guard = { kind: 'unauthorized' };
  } else if (currentUser.loading) {
    guard = { kind: 'loading' };
  } else if (currentUser.error) {
    guard = {
      kind: 'error',
      message: currentUser.error,
      onRetry: currentUser.refetch,
    };
  } else if (!publicUser) {
    guard = {
      kind: 'empty',
      message: 'No profile data is available for this account yet.',
    };
  }

  const memberships = publicUser
    ? classroomMembers.items.filter((member) => member.user_id === publicUser.id)
    : [];
  const studentClassroomIds = new Set(
    memberships
      .filter((member) => member.role === 'student')
      .map((member) => member.classroom_id),
  );
  const instructorClassroomIds = new Set(
    memberships
      .filter((member) => member.role === 'instructor')
      .map((member) => member.classroom_id),
  );

  const upcomingAssignments = assignments.items
    .filter((assignment) => {
      if (!studentClassroomIds.has(assignment.classroom_id)) return false;
      if (!assignment.due_at) return true;
      return new Date(assignment.due_at).getTime() >= pageLoadedAt;
    })
    .sort(compareByDueDate);

  const inProgressAttempt =
    attempts.items.find(
      (attempt) =>
        attempt.student_user_id === publicUser?.id && attempt.status === 'in_progress',
    ) ?? null;

  const instructorClassrooms = classrooms.items.filter((classroom) =>
    instructorClassroomIds.has(classroom.id),
  );

  const showStudentAssignments = studentClassroomIds.size > 0;
  const showInstructorClassrooms = instructorClassroomIds.size > 0;
  const hasVisibleDashboardSections =
    Boolean(inProgressAttempt) || showStudentAssignments || showInstructorClassrooms;

  return {
    displayName,
    guard,
    membershipsGuard: createGuard({
      unauthorized: classroomMembers.unauthorized,
      loading: classroomMembers.loading,
      error: classroomMembers.error,
      onRetry: classroomMembers.refetch,
    }),
    attemptsGuard: createGuard({
      unauthorized: attempts.unauthorized,
      loading: attempts.loading,
      error: attempts.error,
      onRetry: attempts.refetch,
    }),
    assignmentsGuard: createGuard({
      unauthorized: assignments.unauthorized,
      loading: assignments.loading,
      error: assignments.error,
      onRetry: assignments.refetch,
      itemCount: upcomingAssignments.length,
      emptyMessage: 'You have no upcoming assignments right now.',
    }),
    classroomsGuard: createGuard({
      unauthorized: classrooms.unauthorized,
      loading: classrooms.loading,
      error: classrooms.error,
      onRetry: classrooms.refetch,
      itemCount: instructorClassrooms.length,
      emptyMessage: 'You are not instructing any classrooms yet.',
    }),
    inProgressAttempt,
    upcomingAssignments,
    instructorClassrooms,
    showStudentAssignments,
    showInstructorClassrooms,
    showEmptyState:
      guard.kind === 'content' &&
      !classroomMembers.loading &&
      !classroomMembers.error &&
      !attempts.loading &&
      !attempts.error &&
      !hasVisibleDashboardSections,
  };
}
