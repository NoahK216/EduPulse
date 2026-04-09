import express from "express";

import type { CurrentUserProfile } from "../../types/publicApi.js";
import { prisma } from "../prisma.js";
import { asAuthedRequest, sendError, sendInternalError, parseStringParam } from "./common.js";

const userSelect = {
  id: true,
  auth_user: {
    select: {
      email: true,
      name: true,
    },
  },
} as const;

function mapUserRow(
  row: Awaited<
    ReturnType<
      typeof prisma.user_profile.findFirst<{
        select: typeof userSelect;
      }>
    >
  >,
): CurrentUserProfile | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.auth_user.email,
    name: row.auth_user.name,
  };
}

export function createPublicMeRouter() {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const authedReq = asAuthedRequest(req);

    try {
      const row = await prisma.user_profile.findFirst({
        where: { id: authedReq.auth.publicUserId },
        select: userSelect,
      });

      const item = mapUserRow(row);

      if (!item) {
        return sendError(res, 404, "NOT_FOUND", "User not found");
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, "Failed to fetch current user", error);
    }
  });

  router.put('/:id', async (req, res) => {
    // User updates are managed by auth, not supported here
    return sendError(
      res,
      400,
      'BAD_REQUEST',
      'User updates are managed by auth and are not supported by this endpoint'
    );
  });

  const deleteOwnAccount = async (req: express.Request, res: express.Response, userId: string) => {
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
        const existingUser = await tx.user_profile.findUnique({
          where: { id: userId },
          select: { id: true },
        });

        if (!existingUser) {
          throw new Error('USER_NOT_FOUND');
        }

        // Remove assignments tied to user-owned/published content or directly assigned by the user.
        await tx.assignment.deleteMany({
          where: {
            OR: [
              { assigned_by_user_id: userId },
              { classroom: { created_by_id: userId } },
              { scenario_version: { scenario: { owner_user_id: userId } } },
              { scenario_version: { published_by_user_id: userId } },
            ],
          },
        });

        // Remove artifacts the user owns that have RESTRICT references to users.
        await tx.classroom.deleteMany({ where: { created_by_id: userId } });
        await tx.scenario.deleteMany({ where: { owner_user_id: userId } });
        await tx.scenario_version.deleteMany({ where: { published_by_user_id: userId } });

        // Remove remaining direct user references.
        await tx.classroom_member.deleteMany({ where: { user_id: userId } });
        await tx.attempt.deleteMany({ where: { student_user_id: userId } });

        await tx.user_profile.delete({ where: { id: userId } });
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
    const id = parseStringParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    return deleteOwnAccount(req, res, id.value);
  });

  return router;
}
