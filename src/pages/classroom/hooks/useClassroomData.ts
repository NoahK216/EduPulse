import { useState } from 'react';

import {
  useAssignment,
  useAssignmentAttempts,
  useAttempt,
  useAttemptResponses,
  useAttempts,
  useClassroom,
  useClassrooms,
  useClassroomAssignments,
  useClassroomMembers,
  useCurrentUser,
  useResponse,
} from '../../../lib/usePublicApiHooks';
import { toUuidOrNull } from '../../../lib/uuid';
import type {
  PublicAssignment,
  PublicAttempt,
  PublicClassroom,
  PublicClassroomMember,
  PublicResponse,
  PublicUser,
} from '../../../types/publicApi';
import type { DataGuardState } from "../../../components/data/DataGuard";

type ClassroomViewerRole = 'instructor' | 'student' | null;
type AssignmentViewerRole = 'instructor' | 'student' | null;

export type ClassroomViewerData = {
  classroomId: string | null;
  classroom: PublicClassroom | null;
  publicUser: PublicUser | null;
  members: PublicClassroomMember[];
  role: ClassroomViewerRole;
  guard: DataGuardState;
  studentView: {
    instructors: PublicClassroomMember[];
    assignments: PublicAssignment[];
    assignmentsGuard: DataGuardState;
  };
  instructorView: {
    currentAssignments: Array<{
      assignment: PublicAssignment;
      completedCount: number;
    }>;
    pastAssignments: Array<{
      assignment: PublicAssignment;
      completedCount: number;
    }>;
    studentMembers: PublicClassroomMember[];
    studentCount: number;
    summaryText: string;
    assignmentsGuard: DataGuardState;
    refetch: () => void;
  };
};

export type ClassroomListData = {
  classrooms: PublicClassroom[];
  guard: DataGuardState;
};

export type AssignmentDetailData = {
  classroomId: string | null;
  assignmentId: string | null;
  assignment: PublicAssignment | null;
  publicUser: PublicUser | null;
  role: AssignmentViewerRole;
  guard: DataGuardState;
  attemptsGuard: DataGuardState;
  attempts: PublicAttempt[];
  latestAttempt: PublicAttempt | null;
  inProgressAttempt: PublicAttempt | null;
  isOpen: boolean;
  isClosed: boolean;
  attemptsUsed: number;
  attemptsRemaining: number | null;
  hasRunnableAttempt: boolean;
  canStartNewAttempt: boolean;
  runnerLink: string | null;
};

export type AttemptDetailData = {
  attemptId: string | null;
  attempt: PublicAttempt | null;
  guard: DataGuardState;
  responsesGuard: DataGuardState;
  responses: PublicResponse[];
};

export type ResponseDetailData = {
  classroomId: string | null;
  assignmentId: string | null;
  attemptId: string | null;
  responseId: string | null;
  response: PublicResponse | null;
  guard: DataGuardState;
};

export type ClassroomMemberDetailData = {
  userId: string | null;
  member: PublicClassroomMember | null;
  guard: DataGuardState;
};

const CONTENT_GUARD: DataGuardState = { kind: 'content' };

function getFirstError(...errors: Array<string | null>) {
  return errors.find((error) => Boolean(error)) ?? null;
}

function normalizeRole(role: string | null | undefined): ClassroomViewerRole {
  if (role === 'instructor' || role === 'student') {
    return role;
  }

  return null;
}

function compareAssignments(left: PublicAssignment, right: PublicAssignment) {
  const leftTime = left.due_at ? new Date(left.due_at).getTime() : Number.MAX_SAFE_INTEGER;
  const rightTime = right.due_at ? new Date(right.due_at).getTime() : Number.MAX_SAFE_INTEGER;

  if (leftTime === rightTime) {
    return left.title.localeCompare(right.title);
  }

  return leftTime - rightTime;
}

function compareAttempts(left: PublicAttempt, right: PublicAttempt) {
  return right.attempt_number - left.attempt_number;
}

function isPastAssignment(assignment: PublicAssignment, now: number) {
  if (assignment.close_at) {
    return new Date(assignment.close_at).getTime() < now;
  }

  if (assignment.due_at) {
    return new Date(assignment.due_at).getTime() < now;
  }

  return false;
}

function getMemberClassroomRole(
  publicUser: PublicUser | null,
  members: PublicClassroomMember[],
): AssignmentViewerRole {
  if (!publicUser) {
    return null;
  }

  const currentMembership =
    members.find((member) => member.user_id === publicUser.id) ?? null;

  return normalizeRole(currentMembership?.role);
}

function getAssignmentProgress(assignmentId: string, attempts: PublicAttempt[]) {
  const submittedStudentIds = new Set<string>();

  attempts.forEach((attempt) => {
    if (attempt.assignment_id !== assignmentId) {
      return;
    }

    if (attempt.status === 'submitted') {
      submittedStudentIds.add(attempt.student_user_id);
    }
  });

  return {
    completedCount: submittedStudentIds.size,
  };
}

function createCollectionGuard({
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
  itemCount: number;
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

  if (emptyMessage && itemCount === 0) {
    return {
      kind: 'empty',
      message: emptyMessage,
    };
  }

  return CONTENT_GUARD;
}

export function useClassroomViewer(
  classroomId: string | null | undefined,
): ClassroomViewerData {
  const [pageLoadedAt] = useState(() => Date.now());
  const validClassroomId = toUuidOrNull(classroomId);
  const currentUser = useCurrentUser();
  const classroom = useClassroom(validClassroomId);
  const members = useClassroomMembers(validClassroomId);
  const assignments = useClassroomAssignments(validClassroomId);
  const classroomItem = classroom.item;
  const publicUser = currentUser.user;
  const memberItems = members.items;
  const role = getMemberClassroomRole(publicUser, members.items);
  const attempts = useAttempts(role === 'instructor' ? { pageSize: 100 } : null);
  const studentMembers = memberItems
    .filter((member) => normalizeRole(member.role) === 'student')
    .sort((left, right) => left.user_name.localeCompare(right.user_name));
  const studentCount = studentMembers.length;
  const sortedAssignments = [...assignments.items].sort(compareAssignments);
  const currentAssignments = sortedAssignments.filter(
    (assignment) => !isPastAssignment(assignment, pageLoadedAt),
  );
  const pastAssignments = sortedAssignments.filter((assignment) =>
    isPastAssignment(assignment, pageLoadedAt),
  );
  const summaryText = assignments.loading
    ? `${studentCount} students | loading assignments`
    : `${studentCount} students | ${currentAssignments.length} active assignments`;
  const instructors = memberItems.filter(
    (member) => normalizeRole(member.role) === 'instructor',
  );
  const classroomAttempts = attempts.items.filter(
    (attempt) => attempt.classroom_id === validClassroomId,
  );
  const currentAssignmentCards = currentAssignments.map((assignment) => ({
    assignment,
    completedCount: getAssignmentProgress(assignment.id, classroomAttempts).completedCount,
  }));
  const pastAssignmentCards = pastAssignments.map((assignment) => ({
    assignment,
    completedCount: getAssignmentProgress(assignment.id, classroomAttempts).completedCount,
  }));

  let guard: DataGuardState = CONTENT_GUARD;

  if (!validClassroomId) {
    guard = {
      kind: 'invalid',
      message: 'The classroom ID in the URL is invalid.',
    };
  } else if (currentUser.unauthorized || classroom.unauthorized || members.unauthorized) {
    guard = { kind: 'unauthorized' };
  } else if (currentUser.loading || classroom.loading || members.loading) {
    guard = { kind: 'loading' };
  } else {
    const baseError = getFirstError(currentUser.error, classroom.error, members.error);

    if (baseError) {
      guard = {
        kind: 'error',
        message: baseError,
        onRetry: () => {
          currentUser.refetch();
          classroom.refetch();
          members.refetch();
        },
      };
    } else if (!classroomItem) {
      guard = {
        kind: 'empty',
        message: 'Classroom not found.',
      };
    } else if (!publicUser) {
      guard = {
        kind: 'empty',
        message: 'Your profile is not available yet.',
      };
    } else if (!role) {
      guard = {
        kind: 'error',
        message: "We couldn't determine your role in this classroom.",
      };
    }
  }

  return {
    classroomId: validClassroomId,
    classroom: classroomItem,
    publicUser,
    members: memberItems,
    role,
    guard,
    studentView: {
      instructors,
      assignments: sortedAssignments,
      assignmentsGuard: createCollectionGuard({
        unauthorized: assignments.unauthorized,
        loading: assignments.loading,
        error: assignments.error,
        onRetry: assignments.refetch,
        itemCount: sortedAssignments.length,
        emptyMessage: 'No assignments found for this classroom.',
      }),
    },
    instructorView: {
      currentAssignments: currentAssignmentCards,
      pastAssignments: pastAssignmentCards,
      studentMembers,
      studentCount,
      summaryText,
      assignmentsGuard: createCollectionGuard({
        unauthorized: assignments.unauthorized || attempts.unauthorized,
        loading: assignments.loading || attempts.loading,
        error: getFirstError(assignments.error, attempts.error),
        onRetry: () => {
          assignments.refetch();
          attempts.refetch();
        },
        itemCount: currentAssignmentCards.length + pastAssignmentCards.length,
      }),
      refetch: () => {
        assignments.refetch();
        attempts.refetch();
      },
    },
  };
}

export function useClassroomListData(): ClassroomListData {
  const classrooms = useClassrooms();

  return {
    classrooms: classrooms.items,
    guard: createCollectionGuard({
      unauthorized: classrooms.unauthorized,
      loading: classrooms.loading,
      error: classrooms.error,
      onRetry: classrooms.refetch,
      itemCount: classrooms.items.length,
      emptyMessage: "No classrooms yet.",
    }),
  };
}

export function useAssignmentDetailData(
  classroomId: string | null | undefined,
  assignmentId: string | null | undefined,
): AssignmentDetailData {
  const [pageLoadedAt] = useState(() => Date.now());
  const validClassroomId = toUuidOrNull(classroomId);
  const validAssignmentId = toUuidOrNull(assignmentId);
  const hasValidIds = validClassroomId !== null && validAssignmentId !== null;
  const currentUser = useCurrentUser();
  const members = useClassroomMembers(validClassroomId);
  const assignment = useAssignment(hasValidIds ? validAssignmentId : null);
  const attempts = useAssignmentAttempts(hasValidIds ? validAssignmentId : null);
  const assignmentItem = assignment.item;
  const publicUser = currentUser.user;
  const role = getMemberClassroomRole(publicUser, members.items);
  const attemptItems = [...attempts.items].sort(compareAttempts);
  const latestAttempt = attemptItems[0] ?? null;
  const inProgressAttempt =
    attemptItems.find((attemptItem) => attemptItem.status === 'in_progress') ?? null;
  const isOpen =
    !assignmentItem?.open_at ||
    new Date(assignmentItem.open_at).getTime() <= pageLoadedAt;
  const isClosed = assignmentItem?.close_at
    ? new Date(assignmentItem.close_at).getTime() <= pageLoadedAt
    : false;
  const attemptsUsed = attemptItems.length;
  const attemptsRemaining =
    assignmentItem?.max_attempts === null || typeof assignmentItem?.max_attempts === 'undefined'
      ? null
      : Math.max(assignmentItem.max_attempts - attemptsUsed, 0);
  const hasRunnableAttempt = Boolean(inProgressAttempt) && !isClosed && isOpen;
  const canStartNewAttempt =
    role === 'student' &&
    !hasRunnableAttempt &&
    !isClosed &&
    isOpen &&
    (assignmentItem?.max_attempts === null ||
      typeof assignmentItem?.max_attempts === 'undefined' ||
      attemptsUsed < assignmentItem.max_attempts);
  const runnerLink =
    hasValidIds && validClassroomId && validAssignmentId
      ? `/classrooms/${validClassroomId}/assignment/${validAssignmentId}/attempt`
      : null;

  let guard: DataGuardState = CONTENT_GUARD;

  if (!hasValidIds) {
    guard = {
      kind: 'invalid',
      message: 'The classroom or assignment ID in the URL is invalid.',
    };
  } else if (
    currentUser.unauthorized ||
    members.unauthorized ||
    assignment.unauthorized ||
    attempts.unauthorized
  ) {
    guard = { kind: 'unauthorized' };
  } else if (currentUser.loading || members.loading) {
    guard = { kind: 'loading' };
  } else {
    const identityError = getFirstError(currentUser.error, members.error);

    if (identityError) {
      guard = {
        kind: 'error',
        message: identityError,
        onRetry: () => {
          currentUser.refetch();
          members.refetch();
        },
      };
    } else if (assignment.loading) {
      guard = { kind: 'loading' };
    } else if (assignment.error) {
      guard = {
        kind: 'error',
        message: assignment.error,
        onRetry: assignment.refetch,
      };
    } else if (!assignmentItem) {
      guard = {
        kind: 'empty',
        message: 'Assignment not found.',
      };
    } else if (!publicUser) {
      guard = {
        kind: 'empty',
        message: 'Your profile is not available yet.',
      };
    } else if (!role) {
      guard = {
        kind: 'error',
        message: "We couldn't determine your role for this assignment.",
      };
    }
  }

  return {
    classroomId: validClassroomId,
    assignmentId: validAssignmentId,
    assignment: assignmentItem,
    publicUser,
    role,
    guard,
    attemptsGuard: createCollectionGuard({
      unauthorized: attempts.unauthorized,
      loading: attempts.loading,
      error: attempts.error,
      onRetry: attempts.refetch,
      itemCount: attemptItems.length,
      emptyMessage:
        role === 'student'
          ? 'You have not started this assignment yet.'
          : 'No attempts found for this assignment.',
    }),
    attempts: attemptItems,
    latestAttempt,
    inProgressAttempt,
    isOpen,
    isClosed,
    attemptsUsed,
    attemptsRemaining,
    hasRunnableAttempt,
    canStartNewAttempt,
    runnerLink,
  };
}

export function useAttemptDetailData(
  attemptId: string | null | undefined,
): AttemptDetailData {
  const validAttemptId = toUuidOrNull(attemptId);
  const attempt = useAttempt(validAttemptId);
  const responses = useAttemptResponses(validAttemptId);

  let guard: DataGuardState = CONTENT_GUARD;

  if (!validAttemptId) {
    guard = {
      kind: 'invalid',
      message: 'The attempt ID in the URL is invalid.',
    };
  } else if (attempt.unauthorized || responses.unauthorized) {
    guard = { kind: 'unauthorized' };
  } else if (attempt.loading) {
    guard = { kind: 'loading' };
  } else if (attempt.error) {
    guard = {
      kind: 'error',
      message: attempt.error,
      onRetry: attempt.refetch,
    };
  } else if (!attempt.item) {
    guard = {
      kind: 'empty',
      message: 'Attempt not found.',
    };
  }

  return {
    attemptId: validAttemptId,
    attempt: attempt.item,
    guard,
    responsesGuard: createCollectionGuard({
      unauthorized: responses.unauthorized,
      loading: responses.loading,
      error: responses.error,
      onRetry: responses.refetch,
      itemCount: responses.items.length,
      emptyMessage: 'No responses found for this attempt.',
    }),
    responses: responses.items,
  };
}

export function useResponseDetailData(
  classroomId: string | null | undefined,
  assignmentId: string | null | undefined,
  attemptId: string | null | undefined,
  responseId: string | null | undefined,
): ResponseDetailData {
  const validClassroomId = toUuidOrNull(classroomId);
  const validAssignmentId = toUuidOrNull(assignmentId);
  const validAttemptId = toUuidOrNull(attemptId);
  const validResponseId = toUuidOrNull(responseId);
  const hasValidIds =
    validClassroomId !== null &&
    validAssignmentId !== null &&
    validAttemptId !== null &&
    validResponseId !== null;
  const response = useResponse(hasValidIds ? validResponseId : null);

  let guard: DataGuardState = CONTENT_GUARD;

  if (!hasValidIds) {
    guard = {
      kind: 'invalid',
      message: 'Invalid route identifiers.',
    };
  } else if (response.unauthorized) {
    guard = { kind: 'unauthorized' };
  } else if (response.loading) {
    guard = { kind: 'loading' };
  } else if (response.error) {
    guard = {
      kind: 'error',
      message: response.error,
      onRetry: response.refetch,
    };
  } else if (!response.item) {
    guard = {
      kind: 'empty',
      message: 'Response not found.',
    };
  }

  return {
    classroomId: validClassroomId,
    assignmentId: validAssignmentId,
    attemptId: validAttemptId,
    responseId: validResponseId,
    response: response.item,
    guard,
  };
}
