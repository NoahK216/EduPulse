import type { Prisma } from '../../../prisma/generated/client.js';

export function accessibleClassroomWhere(
  userId: string,
): Prisma.classroomWhereInput {
  return {
    OR: [{ members: { some: { user_id: userId } } }],
  };
}

export function instructorClassroomWhere(
  userId: string,
): Prisma.classroomWhereInput {
  return {
    OR: [{ members: { some: { user_id: userId, role: "instructor" } } }],
  };
}

export function studentClassroomWhere(
  userId: string
): Prisma.classroomWhereInput {
  return {
    members: { some: { user_id: userId, role: 'student' } },
  };
}

export function accessibleAssignmentWhere(
  userId: string
): Prisma.assignmentWhereInput {
  return {
    classroom: accessibleClassroomWhere(userId),
  };
}

export function accessibleAttemptWhere(
  userId: string
): Prisma.attemptWhereInput {
  return {
    OR: [
      { student_user_id: userId },
      {
        assignment: {
          classroom: instructorClassroomWhere(userId),
        },
      },
    ],
  };
}

export function accessibleResponseWhere(
  userId: string
): Prisma.responseWhereInput {
  return {
    OR: [
      {
        attempt: {
          student_user_id: userId,
        },
      },
      {
        attempt: {
          assignment: {
            classroom: instructorClassroomWhere(userId),
          },
        },
      },
    ],
  };
}
