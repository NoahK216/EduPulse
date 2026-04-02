import express from "express";

import type { CurrentUserProfile } from "../../types/publicApi.js";
import { prisma } from "../prisma.js";
import { asAuthedRequest, sendError, sendInternalError } from "./common.js";

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

  return router;
}
