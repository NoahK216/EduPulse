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

  router.put('/:id', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseIntParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    if (id.value !== authedReq.auth.publicUserId) {
      return sendError(res, 403, 'FORBIDDEN', 'You can only update your own profile');
    }

    const { name, email } = req.body;

    // Validate input
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return sendError(res, 400, 'BAD_REQUEST', 'Name must be a non-empty string');
    }

    if (email !== undefined) {
      return sendError(
        res,
        400,
        'BAD_REQUEST',
        'Email changes are managed by auth and are not supported by this endpoint'
      );
    }

    try {
      const updateData: { name?: string; updated_at: Date } = {
        updated_at: new Date(),
      };

      if (name !== undefined) {
        updateData.name = name.trim();
      }

      const updatedUser = await prisma.public_user.update({
        where: { id: id.value },
        data: updateData,
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

      return res.json({ item: mapUserRow(updatedUser) });
    } catch (error) {
      return sendInternalError(res, 'Failed to update user', error);
    }
  });

  const deleteOwnAccount = async (req: express.Request, res: express.Response, userId: number) => {
    const authedReq = asAuthedRequest(req);
    if (userId !== authedReq.auth.publicUserId) {
      return sendError(res, 403, 'FORBIDDEN', 'You can only delete your own account');
    }

    const confirmation = req.body?.confirm;
    const acknowledgeDataDeletion = req.body?.acknowledgeDataDeletion;
    const acknowledgeNoRecovery = req.body?.acknowledgeNoRecovery;
    if (confirmation !== 'DELETE') {
      return sendError(
        res,
        400,
        'BAD_REQUEST',
        'Account deletion requires confirm="DELETE"'
      );
    }
    if (acknowledgeDataDeletion !== true || acknowledgeNoRecovery !== true) {
      return sendError(
        res,
        400,
        'BAD_REQUEST',
        'Account deletion requires both security acknowledgements'
      );
    }

    try {
      await prisma.$transaction(async (tx) => {
        const existingUser = await tx.public_user.findUnique({
          where: { id: userId },
          select: { id: true, auth_user_id: true },
        });

        if (!existingUser) {
          throw new Error('USER_NOT_FOUND');
        }

        // Remove assignments tied to user-owned/published content or directly assigned by the user.
        await tx.assignment.deleteMany({
          where: {
            OR: [
              { assigned_by_user_id: userId },
              { classroom: { created_by_user_id: userId } },
              { scenario_version: { scenario: { owner_user_id: userId } } },
              { scenario_version: { published_by_user_id: userId } },
            ],
          },
        });

        // Remove artifacts the user owns that have RESTRICT references to users.
        await tx.classroom.deleteMany({ where: { created_by_user_id: userId } });
        await tx.scenario.deleteMany({ where: { owner_user_id: userId } });
        await tx.scenario_version.deleteMany({ where: { published_by_user_id: userId } });

        // Remove remaining direct user references.
        await tx.classroom_member.deleteMany({ where: { user_id: userId } });
        await tx.attempt.deleteMany({ where: { student_user_id: userId } });

        await tx.public_user.delete({ where: { id: userId } });

        if (existingUser.auth_user_id) {
          await tx.user.delete({ where: { id: existingUser.auth_user_id } });
        }
      });

      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        return sendError(res, 404, 'NOT_FOUND', 'User not found');
      }
      return sendInternalError(res, 'Failed to delete account', error);
    }
  };

  router.delete('/me', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    return deleteOwnAccount(req, res, authedReq.auth.publicUserId);
  });

  // Backward-compatible route for older clients.
  router.delete('/:id', async (req, res) => {
    const id = parseIntParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    return deleteOwnAccount(req, res, id.value);
  });

  return router;
}
