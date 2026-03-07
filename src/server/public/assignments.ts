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
import { accessibleAssignmentWhere } from './scopes.js';

const assignmentSelect = {
  id: true,
  classroom_id: true,
  scenario_version_id: true,
  assigned_by_user_id: true,
  title: true,
  instructions: true,
  open_at: true,
  due_at: true,
  close_at: true,
  max_attempts: true,
  created_at: true,
  updated_at: true,
  classroom: { select: { name: true } },
  scenario_version: { select: { title: true, version_number: true } },
  assigned_by: {
    select: {
      auth_user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  },
  _count: { select: { attempts: true } },
} as const;

function mapAssignmentRow(
  row: Awaited<
    ReturnType<
      typeof prisma.assignment.findFirst<{
        select: typeof assignmentSelect;
      }>
    >
  >
) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    classroom_id: row.classroom_id,
    scenario_version_id: row.scenario_version_id,
    assigned_by_user_id: row.assigned_by_user_id,
    title: row.title,
    instructions: row.instructions,
    open_at: row.open_at,
    due_at: row.due_at,
    close_at: row.close_at,
    max_attempts: row.max_attempts,
    created_at: row.created_at,
    updated_at: row.updated_at,
    classroom_name: row.classroom.name,
    scenario_version_title: row.scenario_version.title,
    scenario_version_number: row.scenario_version.version_number,
    assigned_by_name: row.assigned_by.auth_user.name,
    assigned_by_email: row.assigned_by.auth_user.email,
    attempt_count: row._count.attempts,
  };
}

export function createPublicAssignmentsRouter() {
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

    const where: Prisma.assignmentWhereInput = accessibleAssignmentWhere(
      authedReq.auth.publicUserId
    );
    if (classroomId.value !== undefined) {
      where.classroom_id = classroomId.value;
    }

    const { page, pageSize, skip, take } = pagination.value;

    try {
      const [total, rows] = await Promise.all([
        prisma.assignment.count({ where }),
        prisma.assignment.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip,
          take,
          select: assignmentSelect,
        }),
      ]);

      return res.json({
        items: rows.map((row) => mapAssignmentRow(row)),
        page,
        pageSize,
        total,
      });
    } catch (error) {
      return sendInternalError(res, 'Failed to list assignments', error);
    }
  });

  router.get('/:id', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseUuidParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    try {
      const row = await prisma.assignment.findFirst({
        where: {
          AND: [
            { id: id.value },
            accessibleAssignmentWhere(authedReq.auth.publicUserId),
          ],
        },
        select: assignmentSelect,
      });

      const item = mapAssignmentRow(row);
      if (!item) {
        return sendError(res, 404, 'NOT_FOUND', 'Assignment not found');
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, 'Failed to fetch assignment', error);
    }
  });

  return router;
}
