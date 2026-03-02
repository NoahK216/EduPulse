import express from 'express';

import { prisma } from '../prisma.js';
import {
  asAuthedRequest,
  parseIntParam,
  parsePagination,
  sendError,
  sendInternalError,
} from './common.js';

function mapUserRow(
  row: Awaited<
    ReturnType<
      typeof prisma.public_user.findFirst<{
        select: {
          id: true;
          auth_user_id: true;
          email: true;
          name: true;
          created_at: true;
          updated_at: true;
          _count: {
            select: {
              created_classrooms: true;
              classroom_members: true;
              scenarios: true;
              attempts: true;
            };
          };
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
    auth_user_id: row.auth_user_id,
    email: row.email,
    name: row.name,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_classroom_count: row._count.created_classrooms,
    classroom_membership_count: row._count.classroom_members,
    owned_scenario_count: row._count.scenarios,
    attempt_count: row._count.attempts,
  };
}

export function createPublicUsersRouter() {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const pagination = parsePagination(req.query);
    if (!pagination.ok) {
      return sendError(res, 400, 'BAD_REQUEST', pagination.message);
    }

    const { page, pageSize, skip, take } = pagination.value;

    try {
      const where = { id: authedReq.auth.publicUserId };

      const [total, rows] = await Promise.all([
        prisma.public_user.count({ where }),
        prisma.public_user.findMany({
          where,
          orderBy: { id: 'asc' },
          skip,
          take,
          select: {
            id: true,
            auth_user_id: true,
            email: true,
            name: true,
            created_at: true,
            updated_at: true,
            _count: {
              select: {
                created_classrooms: true,
                classroom_members: true,
                scenarios: true,
                attempts: true,
              },
            },
          },
        }),
      ]);

      return res.json({
        items: rows.map((row) => mapUserRow(row)),
        page,
        pageSize,
        total,
      });
    } catch (error) {
      return sendInternalError(res, 'Failed to list users', error);
    }
  });

  router.get('/:id', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseIntParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    if (id.value !== authedReq.auth.publicUserId) {
      return sendError(res, 404, 'NOT_FOUND', 'User not found');
    }

    try {
      const row = await prisma.public_user.findFirst({
        where: { id: id.value },
        select: {
          id: true,
          auth_user_id: true,
          email: true,
          name: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              created_classrooms: true,
              classroom_members: true,
              scenarios: true,
              attempts: true,
            },
          },
        },
      });

      const item = mapUserRow(row);
      if (!item) {
        return sendError(res, 404, 'NOT_FOUND', 'User not found');
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, 'Failed to fetch user', error);
    }
  });

  return router;
}
