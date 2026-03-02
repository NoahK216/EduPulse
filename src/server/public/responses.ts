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
import { accessibleResponseWhere } from './scopes.js';

function mapResponseRow(
  row: Awaited<
    ReturnType<
      typeof prisma.response.findFirst<{
        select: {
          id: true;
          attempt_id: true;
          node_id: true;
          response_payload: true;
          feedback: true;
          created_at: true;
          attempt: {
            select: {
              id: true;
              attempt_number: true;
              assignment: {
                select: {
                  id: true;
                  title: true;
                  classroom: { select: { id: true; name: true } };
                };
              };
              student: { select: { name: true; email: true } };
            };
          };
        };
      }>
    >
  >,
  includePayload: boolean
) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    attempt_id: row.attempt_id,
    node_id: row.node_id,
    feedback: row.feedback,
    created_at: row.created_at,
    attempt_number: row.attempt.attempt_number,
    assignment_id: row.attempt.assignment.id,
    assignment_title: row.attempt.assignment.title,
    classroom_id: row.attempt.assignment.classroom.id,
    classroom_name: row.attempt.assignment.classroom.name,
    student_name: row.attempt.student.name,
    student_email: row.attempt.student.email,
    has_response_payload: row.response_payload !== null,
    response_payload: includePayload ? row.response_payload : undefined,
  };
}

export function createPublicResponsesRouter() {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const pagination = parsePagination(req.query);
    if (!pagination.ok) {
      return sendError(res, 400, 'BAD_REQUEST', pagination.message);
    }

    const attemptId = parseOptionalIntQuery(req.query, 'attemptId');
    if (!attemptId.ok) {
      return sendError(res, 400, 'BAD_REQUEST', attemptId.message);
    }

    const where: Prisma.responseWhereInput = accessibleResponseWhere(
      authedReq.auth.publicUserId
    );
    if (attemptId.value !== undefined) {
      where.attempt_id = attemptId.value;
    }

    const { page, pageSize, skip, take } = pagination.value;

    try {
      const [total, rows] = await Promise.all([
        prisma.response.count({ where }),
        prisma.response.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip,
          take,
          select: {
            id: true,
            attempt_id: true,
            node_id: true,
            response_payload: true,
            feedback: true,
            created_at: true,
            attempt: {
              select: {
                id: true,
                attempt_number: true,
                assignment: {
                  select: {
                    id: true,
                    title: true,
                    classroom: { select: { id: true, name: true } },
                  },
                },
                student: { select: { name: true, email: true } },
              },
            },
          },
        }),
      ]);

      return res.json({
        items: rows.map((row) => mapResponseRow(row, false)),
        page,
        pageSize,
        total,
      });
    } catch (error) {
      return sendInternalError(res, 'Failed to list responses', error);
    }
  });

  router.get('/:id', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseIntParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    try {
      const row = await prisma.response.findFirst({
        where: {
          AND: [{ id: id.value }, accessibleResponseWhere(authedReq.auth.publicUserId)],
        },
        select: {
          id: true,
          attempt_id: true,
          node_id: true,
          response_payload: true,
          feedback: true,
          created_at: true,
          attempt: {
            select: {
              id: true,
              attempt_number: true,
              assignment: {
                select: {
                  id: true,
                  title: true,
                  classroom: { select: { id: true, name: true } },
                },
              },
              student: { select: { name: true, email: true } },
            },
          },
        },
      });

      const item = mapResponseRow(row, true);
      if (!item) {
        return sendError(res, 404, 'NOT_FOUND', 'Response not found');
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, 'Failed to fetch response', error);
    }
  });

  return router;
}
