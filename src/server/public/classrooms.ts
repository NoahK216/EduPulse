import express from 'express';
import type { Prisma } from '../../../prisma/generated/client.js';

import { prisma } from '../prisma.js';
import {
  asAuthedRequest,
  parseIntParam,
  parsePagination,
  sendError,
  sendInternalError,
} from './common.js';
import { accessibleClassroomWhere } from './scopes.js';

function mapClassroomRow(
  row: Awaited<
    ReturnType<
      typeof prisma.classroom.findFirst<{
        select: {
          id: true;
          created_by_user_id: true;
          name: true;
          code: true;
          created_at: true;
          updated_at: true;
          created_by: { select: { name: true; email: true } };
          _count: { select: { members: true; assignments: true } };
        };
      }>
    >
  >
) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    created_by_user_id: row.created_by_user_id,
    name: row.name,
    code: row.code,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by_name: row.created_by.name,
    created_by_email: row.created_by.email,
    member_count: row._count.members,
    assignment_count: row._count.assignments,
  };
}

export function createPublicClassroomsRouter() {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const pagination = parsePagination(req.query);
    if (!pagination.ok) {
      return sendError(res, 400, 'BAD_REQUEST', pagination.message);
    }

    const { page, pageSize, skip, take } = pagination.value;
    const where = accessibleClassroomWhere(authedReq.auth.publicUserId);

    try {
      const [total, rows] = await Promise.all([
        prisma.classroom.count({ where }),
        prisma.classroom.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip,
          take,
          select: {
            id: true,
            created_by_user_id: true,
            name: true,
            code: true,
            created_at: true,
            updated_at: true,
            created_by: { select: { name: true, email: true } },
            _count: { select: { members: true, assignments: true } },
          },
        }),
      ]);

      return res.json({
        items: rows.map((row) => mapClassroomRow(row)),
        page,
        pageSize,
        total,
      });
    } catch (error) {
      return sendInternalError(res, 'Failed to list classrooms', error);
    }
  });

  router.get('/:id', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseIntParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    const where: Prisma.classroomWhereInput = {
      AND: [{ id: id.value }, accessibleClassroomWhere(authedReq.auth.publicUserId)],
    };

    try {
      const row = await prisma.classroom.findFirst({
        where,
        select: {
          id: true,
          created_by_user_id: true,
          name: true,
          code: true,
          created_at: true,
          updated_at: true,
          created_by: { select: { name: true, email: true } },
          _count: { select: { members: true, assignments: true } },
        },
      });

      const item = mapClassroomRow(row);
      if (!item) {
        return sendError(res, 404, 'NOT_FOUND', 'Classroom not found');
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, 'Failed to fetch classroom', error);
    }
  });

  return router;
}
