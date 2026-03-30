import type { Prisma } from '../../../prisma/generated/client.js';

export function accessibleClassroomWhere(
  publicUserId: string
): Prisma.classroomWhereInput {
  return {
    OR: [
      { created_by_id: publicUserId },
      { members: { some: { user_id: publicUserId } } },
    ],
  };
}

export function instructorClassroomWhere(
  publicUserId: string
): Prisma.classroomWhereInput {
  return {
    OR: [
      { created_by_id: publicUserId },
      { members: { some: { user_id: publicUserId, role: 'instructor' } } },
    ],
  };
}

export function accessibleAssignmentWhere(
  publicUserId: string
): Prisma.assignmentWhereInput {
  return {
    classroom: accessibleClassroomWhere(publicUserId),
  };
}

export function accessibleAttemptWhere(
  publicUserId: string
): Prisma.attemptWhereInput {
  return {
    assignment: {
      classroom: accessibleClassroomWhere(publicUserId),
    },
  };
}

export function accessibleResponseWhere(
  publicUserId: string
): Prisma.responseWhereInput {
  return {
    attempt: {
      assignment: {
        classroom: accessibleClassroomWhere(publicUserId),
      },
    },
  };
}
