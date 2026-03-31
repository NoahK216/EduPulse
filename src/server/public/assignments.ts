import express from 'express';
import { z } from 'zod';
import type { Prisma } from '../../../prisma/generated/client.js';

import { ScenarioSchema } from '../../pages/scenario/scenarioSchemas.js';
import { prisma } from '../prisma.js';
import {
  type ApiErrorCode,
  asAuthedRequest,
  parseOptionalUuidQuery,
  parsePagination,
  parseUuidParam,
  sendError,
  sendInternalError,
} from './common.js';
import { attemptSelect, mapAttemptRow } from './attempts.js';
import { mapResponseRow, responseSelect } from './responses.js';
import {
  accessibleAssignmentWhere,
  accessibleClassroomWhere,
  instructorClassroomWhere,
  studentClassroomWhere,
} from './scopes.js';

const createAssignmentBodySchema = z
  .object({
    classroom_id: z.string().uuid(),
    scenario_id: z.string().uuid().optional(),
    scenario_version_id: z.string().uuid().optional(),
    title: z.string().trim().max(255).nullable().optional(),
    instructions: z.string().trim().nullable().optional(),
    open_at: z.string().trim().nullable().optional(),
    due_at: z.string().trim().nullable().optional(),
    close_at: z.string().trim().nullable().optional(),
    max_attempts: z.number().int().positive().nullable().optional(),
  })
  .superRefine((value, context) => {
    const hasScenarioId = typeof value.scenario_id === 'string';
    const hasScenarioVersionId = typeof value.scenario_version_id === 'string';

    if (hasScenarioId === hasScenarioVersionId) {
      context.addIssue({
        code: 'custom',
        message: 'Provide exactly one of scenario_id or scenario_version_id',
        path: ['scenario_id'],
      });
    }
  });

class RouteError extends Error {
  status: number;
  code: ApiErrorCode;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

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

const assignmentAttemptSessionSelect = {
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
  scenario_version: {
    select: {
      title: true,
      version_number: true,
      content: true,
    },
  },
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

function normalizeOptionalText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return value.length > 0 ? value : null;
}

function parseOptionalDateTime(
  value: string | null | undefined,
  field: string
):
  | { ok: true; value: Date | null }
  | { ok: false; message: string } {
  if (!value) {
    return { ok: true, value: null };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return {
      ok: false,
      message: `${field} must be a valid datetime`,
    };
  }

  return {
    ok: true,
    value: parsed,
  };
}

function toJsonInput(
  value: Prisma.JsonValue
):
  | { ok: true; value: Prisma.InputJsonValue }
  | { ok: false; message: string } {
  try {
    const normalized = JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
    return { ok: true, value: normalized };
  } catch {
    return {
      ok: false,
      message: 'Scenario draft content must be valid JSON-serializable data',
    };
  }
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

  router.post('/:id/attempt', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseUuidParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    try {
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: id.value,
          classroom: studentClassroomWhere(authedReq.auth.publicUserId),
        },
        select: assignmentAttemptSessionSelect,
      });

      if (!assignment) {
        return sendError(res, 404, 'NOT_FOUND', 'Assignment not found');
      }

      const parsedScenario = ScenarioSchema.safeParse(
        assignment.scenario_version.content
      );
      if (!parsedScenario.success) {
        return sendError(
          res,
          500,
          'INTERNAL_ERROR',
          'Published scenario content is invalid for this assignment'
        );
      }

      const scenario = parsedScenario.data;
      if (!(scenario.startNodeId in scenario.nodes)) {
        return sendError(
          res,
          500,
          'INTERNAL_ERROR',
          'Published scenario is missing its start node'
        );
      }

      const now = new Date();
      if (assignment.open_at && assignment.open_at > now) {
        return sendError(res, 400, 'BAD_REQUEST', 'Assignment is not open yet');
      }

      if (assignment.close_at && assignment.close_at <= now) {
        return sendError(res, 400, 'BAD_REQUEST', 'Assignment is closed');
      }

      const session = await prisma.$transaction(async (tx) => {
        let attempt = await tx.attempt.findFirst({
          where: {
            assignment_id: assignment.id,
            student_user_id: authedReq.auth.publicUserId,
            status: 'in_progress',
          },
          orderBy: { attempt_number: 'desc' },
          select: attemptSelect,
        });

        if (attempt) {
          if (!attempt.current_node_id) {
            attempt =
              (await tx.attempt.update({
                where: { id: attempt.id },
                data: {
                  current_node_id: scenario.startNodeId,
                  last_activity_at: now,
                },
                select: attemptSelect,
              })) ?? attempt;
          }

          const responses = await tx.response.findMany({
            where: { attempt_id: attempt.id },
            orderBy: { created_at: 'asc' },
            select: responseSelect,
          });

          return {
            attempt,
            responses,
          };
        }

        const latestAttempt = await tx.attempt.findFirst({
          where: {
            assignment_id: assignment.id,
            student_user_id: authedReq.auth.publicUserId,
          },
          orderBy: { attempt_number: 'desc' },
          select: {
            attempt_number: true,
          },
        });

        const nextAttemptNumber = (latestAttempt?.attempt_number ?? 0) + 1;
        if (
          assignment.max_attempts !== null &&
          typeof assignment.max_attempts === 'number' &&
          nextAttemptNumber > assignment.max_attempts
        ) {
          throw new RouteError(
            400,
            'BAD_REQUEST',
            'You have reached the maximum number of attempts for this assignment'
          );
        }

        attempt = await tx.attempt.create({
          data: {
            assignment_id: assignment.id,
            student_user_id: authedReq.auth.publicUserId,
            attempt_number: nextAttemptNumber,
            current_node_id: scenario.startNodeId,
            last_activity_at: now,
          },
          select: attemptSelect,
        });

        return {
          attempt,
          responses: [],
        };
      });

      return res.json({
        item: {
          assignment: mapAssignmentRow(assignment),
          attempt: mapAttemptRow(session.attempt),
          responses: session.responses.map((response) => mapResponseRow(response, true)),
          scenario_content: assignment.scenario_version.content,
        },
      });
    } catch (error) {
      if (error instanceof RouteError) {
        return sendError(res, error.status, error.code, error.message);
      }

      return sendInternalError(res, 'Failed to start assignment attempt', error);
    }
  });

  router.post('/', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const parsed = createAssignmentBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Invalid request body',
        details: parsed.error.flatten(),
      });
    }

    const title = normalizeOptionalText(parsed.data.title);
    const instructions = normalizeOptionalText(parsed.data.instructions);
    const openAt = parseOptionalDateTime(parsed.data.open_at, 'open_at');
    if (!openAt.ok) {
      return sendError(res, 400, 'BAD_REQUEST', openAt.message);
    }

    const dueAt = parseOptionalDateTime(parsed.data.due_at, 'due_at');
    if (!dueAt.ok) {
      return sendError(res, 400, 'BAD_REQUEST', dueAt.message);
    }

    const closeAt = parseOptionalDateTime(parsed.data.close_at, 'close_at');
    if (!closeAt.ok) {
      return sendError(res, 400, 'BAD_REQUEST', closeAt.message);
    }

    if (
      openAt.value &&
      dueAt.value &&
      openAt.value.getTime() > dueAt.value.getTime()
    ) {
      return sendError(res, 400, 'BAD_REQUEST', 'open_at must be before due_at');
    }

    if (
      dueAt.value &&
      closeAt.value &&
      closeAt.value.getTime() < dueAt.value.getTime()
    ) {
      return sendError(res, 400, 'BAD_REQUEST', 'close_at must be after due_at');
    }

    if (
      openAt.value &&
      closeAt.value &&
      openAt.value.getTime() > closeAt.value.getTime()
    ) {
      return sendError(res, 400, 'BAD_REQUEST', 'open_at must be before close_at');
    }

    try {
      const accessibleClassroom = await prisma.classroom.findFirst({
        where: {
          AND: [
            { id: parsed.data.classroom_id },
            accessibleClassroomWhere(authedReq.auth.publicUserId),
          ],
        },
        select: { id: true },
      });

      if (!accessibleClassroom) {
        throw new RouteError(404, 'NOT_FOUND', 'Classroom not found');
      }

      const instructorClassroom = await prisma.classroom.findFirst({
        where: {
          AND: [
            { id: parsed.data.classroom_id },
            instructorClassroomWhere(authedReq.auth.publicUserId),
          ],
        },
        select: { id: true },
      });

      if (!instructorClassroom) {
        throw new RouteError(
          403,
          'FORBIDDEN',
          'You must be an instructor in this classroom to assign scenarios'
        );
      }

      const row = await prisma.$transaction(async (tx) => {
        let scenarioVersionId: string;
        let fallbackTitle: string;

        if (parsed.data.scenario_version_id) {
          const version = await tx.scenario_version.findFirst({
            where: {
              id: parsed.data.scenario_version_id,
              scenario: { owner_user_id: authedReq.auth.publicUserId },
            },
            select: {
              id: true,
              scenario: {
                select: {
                  title: true,
                },
              },
            },
          });

          if (!version) {
            throw new RouteError(404, 'NOT_FOUND', 'Scenario version not found');
          }

          scenarioVersionId = version.id;
          fallbackTitle = version.scenario.title;
        } else {
          const scenario = await tx.scenario.findFirst({
            where: {
              id: parsed.data.scenario_id,
              owner_user_id: authedReq.auth.publicUserId,
            },
            select: {
              id: true,
              title: true,
              draft_content: true,
              latest_version_number: true,
            },
          });

          if (!scenario) {
            throw new RouteError(404, 'NOT_FOUND', 'Scenario not found');
          }

          if (scenario.draft_content === null) {
            throw new RouteError(
              400,
              'BAD_REQUEST',
              'Scenario draft content is required before assigning'
            );
          }

          const jsonContent = toJsonInput(scenario.draft_content);
          if (!jsonContent.ok) {
            throw new RouteError(400, 'BAD_REQUEST', jsonContent.message);
          }

          const now = new Date();
          const nextVersionNumber = scenario.latest_version_number + 1;
          const publishedVersion = await tx.scenario_version.create({
            data: {
              scenario_id: scenario.id,
              version_number: nextVersionNumber,
              title: scenario.title,
              content: jsonContent.value,
              published_by_user_id: authedReq.auth.publicUserId,
              published_at: now,
            },
            select: { id: true },
          });

          await tx.scenario.update({
            where: { id: scenario.id },
            data: {
              latest_version_number: nextVersionNumber,
              updated_at: now,
            },
            select: { id: true },
          });

          scenarioVersionId = publishedVersion.id;
          fallbackTitle = scenario.title;
        }

        return tx.assignment.create({
          data: {
            classroom_id: parsed.data.classroom_id,
            scenario_version_id: scenarioVersionId,
            assigned_by_user_id: authedReq.auth.publicUserId,
            title: title ?? fallbackTitle,
            instructions,
            open_at: openAt.value,
            due_at: dueAt.value,
            close_at: closeAt.value,
            max_attempts: parsed.data.max_attempts ?? null,
          },
          select: assignmentSelect,
        });
      });

      const item = mapAssignmentRow(row);
      if (!item) {
        throw new RouteError(
          500,
          'INTERNAL_ERROR',
          'Assignment created but could not be loaded'
        );
      }

      return res.status(201).json({ item });
    } catch (error) {
      if (error instanceof RouteError) {
        return sendError(res, error.status, error.code, error.message);
      }

      return sendInternalError(res, 'Failed to create assignment', error);
    }
  });

  return router;
}
