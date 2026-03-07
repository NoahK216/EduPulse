import express from 'express';
import type { Prisma } from '../../../prisma/generated/client.js';

import { prisma } from '../prisma.js';
import {
  asAuthedRequest,
  parseOptionalUuidQuery,
  parsePagination,
  parseUuidParam,
  sendError,
  sendInternalError,
} from './common.js';
import { accessibleClassroomWhere } from './scopes.js';

const classroomMemberSelect = {
  classroom_id: true,
  user_id: true,
  role: true,
  created_at: true,
  updated_at: true,
  classroom: { select: { name: true } },
  user: {
    select: {
      auth_user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  },
} as const;

function mapClassroomMemberRow(
  row: Awaited<
    ReturnType<
      typeof prisma.classroom_member.findFirst<{
        select: typeof classroomMemberSelect;
      }>
    >
  >
) {
  if (!row) {
    return null;
  }

  return {
    classroom_id: row.classroom_id,
    user_id: row.user_id,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
    classroom_name: row.classroom.name,
    user_name: row.user.auth_user.name,
    user_email: row.user.auth_user.email,
  };
}

export function createPublicClassroomMembersRouter() {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const pagination = parsePagination(req.query);
    if (!pagination.ok) {
      return sendError(res, 400, 'BAD_REQUEST', pagination.message);
    }

    const classroomId = parseOptionalUuidQuery(req.query, 'classroomId');
    if (!classroomId.ok) {
      return sendError(res, 400, 'BAD_REQUEST', classroomId.message);
    }

    const where: Prisma.classroom_memberWhereInput = {
      classroom: accessibleClassroomWhere(authedReq.auth.publicUserId),
    };
    if (classroomId.value !== undefined) {
      where.classroom_id = classroomId.value;
    }

    const { page, pageSize, skip, take } = pagination.value;

    try {
      const [total, rows] = await Promise.all([
        prisma.classroom_member.count({ where }),
        prisma.classroom_member.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip,
          take,
          select: classroomMemberSelect,
        }),
      ]);

      return res.json({
        items: rows.map((row) => mapClassroomMemberRow(row)),
        page,
        pageSize,
        total,
      });
    } catch (error) {
      return sendInternalError(res, 'Failed to list classroom members', error);
    }
  });

  router.get('/:classroomId/:userId', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const classroomId = parseUuidParam('classroomId', req.params.classroomId);
    if (!classroomId.ok) {
      return sendError(res, 400, 'BAD_REQUEST', classroomId.message);
    }

    const userId = parseUuidParam('userId', req.params.userId);
    if (!userId.ok) {
      return sendError(res, 400, 'BAD_REQUEST', userId.message);
    }

    try {
      const row = await prisma.classroom_member.findFirst({
        where: {
          AND: [
            { classroom_id: classroomId.value, user_id: userId.value },
            { classroom: accessibleClassroomWhere(authedReq.auth.publicUserId) },
          ],
        },
        select: classroomMemberSelect,
      });

      const item = mapClassroomMemberRow(row);
      if (!item) {
        return sendError(res, 404, 'NOT_FOUND', 'Classroom member not found');
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, 'Failed to fetch classroom member', error);
    }
  });

  return router;
}
