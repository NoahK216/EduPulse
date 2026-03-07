import express from 'express';

import { prisma } from '../prisma.js';
import {
  asAuthedRequest,
  parsePagination,
  parseUuidParam,
  sendError,
  sendInternalError,
} from './common.js';

const userSelect = {
  id: true,
  auth_user: {
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  _count: {
    select: {
      created_classrooms: true,
      classroom_members: true,
      scenarios: true,
      attempts: true,
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
) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    auth_user_id: row.auth_user.id,
    email: row.auth_user.email,
    name: row.auth_user.name,
    created_at: row.auth_user.createdAt,
    updated_at: row.auth_user.updatedAt,
    created_classroom_count: row._count.created_classrooms,
    classroom_membership_count: row._count.classroom_members,
    owned_scenario_count: row._count.scenarios,
    attempt_count: row._count.attempts,
  };
}

export function createPublicUsersRouter() {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const pagination = parsePagination(req.query);
    if (!pagination.ok) {
      return sendError(res, 400, "BAD_REQUEST", pagination.message);
    }

    const { page, pageSize, skip, take } = pagination.value;

    try {
      const where = { id: authedReq.auth.publicUserId };

      const [total, rows] = await Promise.all([
        prisma.user_profile.count({ where }),
        prisma.user_profile.findMany({
          where,
          orderBy: { id: "asc" },
          skip,
          take,
          select: userSelect,
        }),
      ]);

      return res.json({
        items: rows.map((row) => mapUserRow(row)),
        page,
        pageSize,
        total,
      });
    } catch (error) {
      return sendInternalError(res, "Failed to list users", error);
    }
  });

  router.get("/:id", async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseUuidParam("id", req.params.id);
    if (!id.ok) {
      return sendError(res, 400, "BAD_REQUEST", id.message);
    }

    if (id.value !== authedReq.auth.publicUserId) {
      return sendError(res, 404, "NOT_FOUND", "User not found");
    }

    try {
      const row = await prisma.user_profile.findFirst({
        where: { id: id.value },
        select: userSelect,
      });

      const item = mapUserRow(row);
      if (!item) {
        return sendError(res, 404, "NOT_FOUND", "User not found");
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, "Failed to fetch user", error);
    }
  });

  return router;
}
