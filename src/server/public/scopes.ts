import type { Prisma } from '../../../prisma/generated/client.js';

export function accessibleClassroomWhere(
  publicUserId: string,
): Prisma.classroomWhereInput {
  return {
    OR: [{ members: { some: { user_id: publicUserId } } }],
  };
}

export function instructorClassroomWhere(
  publicUserId: string,
): Prisma.classroomWhereInput {
  return {
    OR: [{ members: { some: { user_id: publicUserId, role: "instructor" } } }],
  };
}

export function studentClassroomWhere(
  publicUserId: string
): Prisma.classroomWhereInput {
  return {
    members: { some: { user_id: publicUserId, role: 'student' } },
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
    OR: [
      { student_user_id: publicUserId },
      {
        assignment: {
          classroom: instructorClassroomWhere(publicUserId),
        },
      },
    ],
  };
}

export function accessibleResponseWhere(
  publicUserId: string
): Prisma.responseWhereInput {
  return {
    OR: [
      {
        attempt: {
          student_user_id: publicUserId,
        },
      },
      {
        attempt: {
          assignment: {
            classroom: instructorClassroomWhere(publicUserId),
          },
        },
      },
    ],
  };
}
