import { randomInt } from "node:crypto";
import express from "express";
import { z } from "zod";
import type { Prisma } from "../../../prisma/generated/client.js";

import { prisma } from "../prisma.js";
import type {
  PublicClassroom,
  PublicClassroomRole,
} from "../../types/publicApi.js";
import {
  asAuthedRequest,
  type Pagination,
  parseUuidParam,
  parsePagination,
  sendError,
  sendInternalError,
} from "./common.js";
import { accessibleClassroomWhere } from "./scopes.js";

const createClassroomBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
});

const joinClassroomBodySchema = z.object({
  code: z.string().trim().min(1).max(64),
});

const CLASSROOM_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CLASSROOM_CODE_LENGTH = 6;
const CLASSROOM_CODE_PATTERN = /^[A-Z0-9]{6}$/;

function buildClassroomSelect(publicUserId: string) {
  return {
    id: true,
    created_by_id: true,
    name: true,
    code: true,
    created_at: true,
    updated_at: true,
    created_by: {
      select: {
        auth_user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    },
    members: {
      where: {
        user_id: publicUserId,
      },
      select: {
        role: true,
      },
      take: 1,
    },
    _count: { select: { members: true, assignments: true } },
  } satisfies Prisma.classroomSelect;
}

type ClassroomSelect = ReturnType<typeof buildClassroomSelect>;
type ClassroomRow = Prisma.classroomGetPayload<{ select: ClassroomSelect }>;

function mapClassroomRow(
  row: ClassroomRow | null,
  activeAssignmentCountByClassroom: Map<string, number>,
): PublicClassroom | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    created_by_id: row.created_by_id,
    name: row.name,
    code: row.code,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    member_count: row._count.members,
    assignment_count: row._count.assignments,
    viewer_role: row.members[0]?.role,
    active_assignment_count: activeAssignmentCountByClassroom.get(row.id) ?? 0,
  };
}

function rolePriority(role: PublicClassroomRole) {
  return role === "instructor" ? 0 : 1;
}

function compareClassrooms(left: PublicClassroom, right: PublicClassroom) {
  if (left.active_assignment_count !== right.active_assignment_count) {
    return right.active_assignment_count - left.active_assignment_count;
  }

  const roleDifference =
    rolePriority(left.viewer_role) - rolePriority(right.viewer_role);
  if (roleDifference !== 0) {
    return roleDifference;
  }

  return left.name.localeCompare(right.name);
}

function isDefined<T>(value: T | null): value is T {
  return value !== null;
}

async function getActiveAssignmentCountByClassroom(
  classroomIds: string[],
): Promise<Map<string, number>> {
  if (classroomIds.length === 0) {
    return new Map();
  }

  const rows = await prisma.assignment.groupBy({
    by: ["classroom_id"],
    where: {
      classroom_id: {
        in: classroomIds,
      },
      OR: [{ close_at: null }, { close_at: { gt: new Date() } }],
    },
    _count: {
      _all: true,
    },
  });

  return new Map(rows.map((row) => [row.classroom_id, row._count._all]));
}

async function listPublicClassrooms(
  publicUserId: string,
  pagination: Pagination,
) {
  const rows = await prisma.classroom.findMany({
    where: accessibleClassroomWhere(publicUserId),
    select: buildClassroomSelect(publicUserId),
  });
  const activeAssignmentCountByClassroom =
    await getActiveAssignmentCountByClassroom(rows.map((row) => row.id));
  const items = rows
    .map((row) => mapClassroomRow(row, activeAssignmentCountByClassroom))
    .filter(isDefined)
    .sort(compareClassrooms);

  return {
    items: items.slice(pagination.skip, pagination.skip + pagination.take),
    total: items.length,
  };
}

async function getPublicClassroomById(
  classroomId: string,
  publicUserId: string,
) {
  const row = await prisma.classroom.findFirst({
    where: {
      AND: [{ id: classroomId }, accessibleClassroomWhere(publicUserId)],
    },
    select: buildClassroomSelect(publicUserId),
  });
  const activeAssignmentCountByClassroom =
    await getActiveAssignmentCountByClassroom(row ? [row.id] : []);

  return mapClassroomRow(row, activeAssignmentCountByClassroom);
}

function normalizeClassroomCode(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed.toUpperCase() : null;
}

function validateClassroomCode(code: string) {
  if (!CLASSROOM_CODE_PATTERN.test(code)) {
    return {
      ok: false as const,
      message: "Classroom code must be exactly 6 letters or numbers",
    };
  }

  return {
    ok: true as const,
  };
}

function createRandomClassroomCode() {
  return Array.from(
    { length: CLASSROOM_CODE_LENGTH },
    () => CLASSROOM_CODE_ALPHABET[randomInt(0, CLASSROOM_CODE_ALPHABET.length)],
  ).join("");
}

async function generateAvailableClassroomCode(tx: Prisma.TransactionClient) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = createRandomClassroomCode();
    const existing = await tx.classroom.findFirst({
      where: { code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Failed to generate an available classroom code");
}

export function createPublicClassroomsRouter() {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const pagination = parsePagination(req.query);
    if (!pagination.ok) {
      return sendError(res, 400, "BAD_REQUEST", pagination.message);
    }

    try {
      const { items, total } = await listPublicClassrooms(
        authedReq.auth.publicUserId,
        pagination.value,
      );

      const { page, pageSize } = pagination.value;

      return res.json({
        items,
        page,
        pageSize,
        total,
      });
    } catch (error) {
      return sendInternalError(res, "Failed to list classrooms", error);
    }
  });

  router.get("/:id", async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseUuidParam("id", req.params.id);
    if (!id.ok) {
      return sendError(res, 400, "BAD_REQUEST", id.message);
    }

    try {
      const item = await getPublicClassroomById(
        id.value,
        authedReq.auth.publicUserId,
      );
      if (!item) {
        return sendError(res, 404, "NOT_FOUND", "Classroom not found");
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, "Failed to fetch classroom", error);
    }
  });

  router.post("/", async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const parsed = createClassroomBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "BAD_REQUEST",
        message: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    try {
      const classroomId = await prisma.$transaction(async (tx) => {
        const now = new Date();
        const code = await generateAvailableClassroomCode(tx);

        const created = await tx.classroom.create({
          data: {
            created_by_id: authedReq.auth.publicUserId,
            name: parsed.data.name,
            code,
            updated_at: now,
          },
          select: { id: true },
        });

        await tx.classroom_member.create({
          data: {
            classroom_id: created.id,
            user_id: authedReq.auth.publicUserId,
            role: "instructor",
            updated_at: now,
          },
          select: { classroom_id: true },
        });

        return created.id;
      });

      const item = await getPublicClassroomById(
        classroomId,
        authedReq.auth.publicUserId,
      );
      if (!item) {
        return sendError(
          res,
          500,
          "INTERNAL_ERROR",
          "Classroom created but could not be loaded",
        );
      }

      return res.status(201).json({ item });
    } catch (error) {
      return sendInternalError(res, "Failed to create classroom", error);
    }
  });

  router.post("/join", async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const parsed = joinClassroomBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "BAD_REQUEST",
        message: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    const code = normalizeClassroomCode(parsed.data.code);
    if (!code) {
      return sendError(res, 400, "BAD_REQUEST", "Classroom code is required");
    }

    const validation = validateClassroomCode(code);
    if (!validation.ok) {
      return sendError(res, 400, "BAD_REQUEST", validation.message);
    }

    try {
      const matchedClassrooms = await prisma.classroom.findMany({
        where: { code },
        orderBy: { created_at: "desc" },
        take: 2,
        select: { id: true },
      });

      if (matchedClassrooms.length === 0) {
        return sendError(res, 404, "NOT_FOUND", "Classroom not found");
      }

      if (matchedClassrooms.length > 1) {
        return sendError(
          res,
          500,
          "INTERNAL_ERROR",
          "This classroom code is ambiguous. Ask the instructor for a new code.",
        );
      }

      const classroomId = matchedClassrooms[0]!.id;
      await prisma.$transaction(async (tx) => {
        const existingMembership = await tx.classroom_member.findFirst({
          where: {
            classroom_id: classroomId,
            user_id: authedReq.auth.publicUserId,
          },
          select: {
            classroom_id: true,
          },
        });

        if (existingMembership) {
          return;
        }

        await tx.classroom_member.create({
          data: {
            classroom_id: classroomId,
            user_id: authedReq.auth.publicUserId,
            role: "student",
            updated_at: new Date(),
          },
          select: {
            classroom_id: true,
          },
        });
      });

      const item = await getPublicClassroomById(
        classroomId,
        authedReq.auth.publicUserId,
      );
      if (!item) {
        return sendError(
          res,
          500,
          "INTERNAL_ERROR",
          "Classroom joined but could not be loaded",
        );
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, "Failed to join classroom", error);
    }
  });

  return router;
}
