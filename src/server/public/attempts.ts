import express from 'express';
import type { Prisma } from '../../../prisma/generated/client.js';

import { prisma } from '../prisma.js';
import {
  asAuthedRequest,
  parseIntParam,
  parseOptionalIntQuery,
  parsePagination,
  sendError,
  sendInternalError,
} from './common.js';
import { accessibleAttemptWhere } from './scopes.js';

function mapAttemptRow(
  row: Awaited<
    ReturnType<
      typeof prisma.attempt.findFirst<{
        select: {
          id: true;
          assignment_id: true;
          student_user_id: true;
          attempt_number: true;
          status: true;
          started_at: true;
          submitted_at: true;
          assignment: {
            select: {
              id: true;
              title: true;
              classroom: { select: { id: true; name: true } };
            };
          };
          student: { select: { name: true; email: true } };
          _count: { select: { responses: true } };
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
    assignment_id: row.assignment_id,
    student_user_id: row.student_user_id,
    attempt_number: row.attempt_number,
    status: row.status,
    started_at: row.started_at,
    submitted_at: row.submitted_at,
    assignment_title: row.assignment.title,
    classroom_id: row.assignment.classroom.id,
    classroom_name: row.assignment.classroom.name,
    student_name: row.student.name,
    student_email: row.student.email,
    response_count: row._count.responses,
  };
}

export function createPublicAttemptsRouter() {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const pagination = parsePagination(req.query);
    if (!pagination.ok) {
      return sendError(res, 400, 'BAD_REQUEST', pagination.message);
    }

    const assignmentId = parseOptionalIntQuery(req.query, 'assignmentId');
    if (!assignmentId.ok) {
      return sendError(res, 400, 'BAD_REQUEST', assignmentId.message);
    }

    const where: Prisma.attemptWhereInput = accessibleAttemptWhere(
      authedReq.auth.publicUserId
    );
    if (assignmentId.value !== undefined) {
      where.assignment_id = assignmentId.value;
    }

    const { page, pageSize, skip, take } = pagination.value;

    try {
      const [total, rows] = await Promise.all([
        prisma.attempt.count({ where }),
        prisma.attempt.findMany({
          where,
          orderBy: { started_at: 'desc' },
          skip,
          take,
          select: {
            id: true,
            assignment_id: true,
            student_user_id: true,
            attempt_number: true,
            status: true,
            started_at: true,
            submitted_at: true,
            assignment: {
              select: {
                id: true,
                title: true,
                classroom: { select: { id: true, name: true } },
              },
            },
            student: { select: { name: true, email: true } },
            _count: { select: { responses: true } },
          },
        }),
      ]);

      return res.json({
        items: rows.map((row) => mapAttemptRow(row)),
        page,
        pageSize,
        total,
      });
    } catch (error) {
      return sendInternalError(res, 'Failed to list attempts', error);
    }
  });

  router.get('/:id', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseIntParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    try {
      const row = await prisma.attempt.findFirst({
        where: {
          AND: [{ id: id.value }, accessibleAttemptWhere(authedReq.auth.publicUserId)],
        },
        select: {
          id: true,
          assignment_id: true,
          student_user_id: true,
          attempt_number: true,
          status: true,
          started_at: true,
          submitted_at: true,
          assignment: {
            select: {
              id: true,
              title: true,
              classroom: { select: { id: true, name: true } },
            },
          },
          student: { select: { name: true, email: true } },
          _count: { select: { responses: true } },
        },
      });

      const item = mapAttemptRow(row);
      if (!item) {
        return sendError(res, 404, 'NOT_FOUND', 'Attempt not found');
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, 'Failed to fetch attempt', error);
    }
  });

  return router;
}
