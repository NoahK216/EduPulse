import type { Prisma } from '../../../prisma/generated/client.js';

export function accessibleClassroomWhere(
  publicUserId: number
): Prisma.classroomWhereInput {
  return {
    OR: [
      { created_by_user_id: publicUserId },
      { members: { some: { user_id: publicUserId } } },
    ],
  };
}

export function accessibleAssignmentWhere(
  publicUserId: number
): Prisma.assignmentWhereInput {
  return {
    classroom: accessibleClassroomWhere(publicUserId),
  };
}

export function accessibleAttemptWhere(
  publicUserId: number
): Prisma.attemptWhereInput {
  return {
    assignment: {
      classroom: accessibleClassroomWhere(publicUserId),
    },
  };
}

export function accessibleResponseWhere(
  publicUserId: number
): Prisma.responseWhereInput {
  return {
    attempt: {
      assignment: {
        classroom: accessibleClassroomWhere(publicUserId),
      },
    },
  };
}
