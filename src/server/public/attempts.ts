import express from 'express';
import { z } from 'zod';
import type OpenAI from 'openai';
import type { Prisma } from '../../../prisma/generated/client.js';

import { gradeWithOpenAI } from '../grader.js';
import { prisma } from '../prisma.js';
import {
  getNextNodeIdForScenarioNode,
  getScenarioNode,
  ScenarioSchema,
} from '../../pages/scenario/scenarioSchemas.js';
import {
  asAuthedRequest,
  parseOptionalUuidQuery,
  parsePagination,
  parseUuidParam,
  sendError,
  sendInternalError,
} from './common.js';
import { mapResponseRow, responseSelect } from './responses.js';
import { accessibleAttemptWhere } from './scopes.js';

const progressBodySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('advance'),
  }),
  z.object({
    type: z.literal('answer_choice'),
    choice_id: z.string().min(1),
  }),
  z.object({
    type: z.literal('answer_free_response'),
    answer_text: z.string().trim().min(1),
  }),
]);

export const attemptSelect = {
  id: true,
  assignment_id: true,
  student_user_id: true,
  attempt_number: true,
  status: true,
  current_node_id: true,
  started_at: true,
  last_activity_at: true,
  submitted_at: true,
  assignment: {
    select: {
      id: true,
      title: true,
      classroom: { select: { id: true, name: true } },
    },
  },
  student: {
    select: {
      auth_user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  },
  _count: { select: { responses: true } },
} as const;

export function mapAttemptRow(
  row: Awaited<
    ReturnType<
      typeof prisma.attempt.findFirst<{
        select: typeof attemptSelect;
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
    current_node_id: row.current_node_id,
    started_at: row.started_at,
    last_activity_at: row.last_activity_at,
    submitted_at: row.submitted_at,
    assignment_title: row.assignment.title,
    classroom_id: row.assignment.classroom.id,
    classroom_name: row.assignment.classroom.name,
    student_name: row.student.auth_user.name,
    student_email: row.student.auth_user.email,
    response_count: row._count.responses,
  };
}

const progressAttemptSelect = {
  id: true,
  assignment_id: true,
  student_user_id: true,
  attempt_number: true,
  status: true,
  current_node_id: true,
  started_at: true,
  last_activity_at: true,
  submitted_at: true,
  assignment: {
    select: {
      id: true,
      title: true,
      open_at: true,
      due_at: true,
      close_at: true,
      classroom: {
        select: {
          id: true,
          name: true,
        },
      },
      scenario_version: {
        select: {
          content: true,
        },
      },
    },
  },
  student: {
    select: {
      auth_user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  },
  _count: { select: { responses: true } },
} as const;

function normalizeNextNodeId(
  scenarioContent: { nodes: Record<string, unknown> },
  nextNodeId: string | null | undefined
) {
  if (!nextNodeId) {
    return null;
  }

  return nextNodeId in scenarioContent.nodes ? nextNodeId : null;
}

export function createPublicAttemptsRouter(openai: OpenAI) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const pagination = parsePagination(req.query);
    if (!pagination.ok) {
      return sendError(res, 400, "BAD_REQUEST", pagination.message);
    }

    const assignmentId = parseOptionalUuidQuery(req.query, "assignmentId");
    if (!assignmentId.ok) {
      return sendError(res, 400, "BAD_REQUEST", assignmentId.message);
    }

    const where: Prisma.attemptWhereInput = accessibleAttemptWhere(
      authedReq.auth.userId,
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
          orderBy: { started_at: "desc" },
          skip,
          take,
          select: attemptSelect,
        }),
      ]);

      return res.json({
        items: rows.map((row) => mapAttemptRow(row)),
        page,
        pageSize,
        total,
      });
    } catch (error) {
      return sendInternalError(res, "Failed to list attempts", error);
    }
  });

  router.get("/:id", async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseUuidParam("id", req.params.id);
    if (!id.ok) {
      return sendError(res, 400, "BAD_REQUEST", id.message);
    }

    try {
      const row = await prisma.attempt.findFirst({
        where: {
          AND: [
            { id: id.value },
            accessibleAttemptWhere(authedReq.auth.userId),
          ],
        },
        select: attemptSelect,
      });

      const item = mapAttemptRow(row);
      if (!item) {
        return sendError(res, 404, "NOT_FOUND", "Attempt not found");
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, "Failed to fetch attempt", error);
    }
  });

  router.post("/:id/progress", async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseUuidParam("id", req.params.id);
    if (!id.ok) {
      return sendError(res, 400, "BAD_REQUEST", id.message);
    }

    const parsed = progressBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "BAD_REQUEST",
        message: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    try {
      const attempt = await prisma.attempt.findFirst({
        where: {
          id: id.value,
          student_user_id: authedReq.auth.userId,
        },
        select: progressAttemptSelect,
      });

      if (!attempt) {
        return sendError(res, 404, "NOT_FOUND", "Attempt not found");
      }

      if (attempt.status !== "in_progress") {
        return sendError(
          res,
          400,
          "BAD_REQUEST",
          "Only in-progress attempts can be updated",
        );
      }

      const now = new Date();
      if (attempt.assignment.open_at && attempt.assignment.open_at > now) {
        return sendError(res, 400, "BAD_REQUEST", "Assignment is not open yet");
      }

      if (attempt.assignment.close_at && attempt.assignment.close_at <= now) {
        return sendError(res, 400, "BAD_REQUEST", "Assignment is closed");
      }

      if (!attempt.current_node_id) {
        return sendError(
          res,
          409,
          "BAD_REQUEST",
          "Attempt progress is out of sync. Reopen the assignment and try again.",
        );
      }

      const parsedScenario = ScenarioSchema.safeParse(
        attempt.assignment.scenario_version.content,
      );
      if (!parsedScenario.success) {
        return sendError(
          res,
          500,
          "INTERNAL_ERROR",
          "Published scenario content is invalid for this assignment",
        );
      }

      const scenario = parsedScenario.data;
      const currentNode = getScenarioNode(scenario, attempt.current_node_id);
      if (!currentNode) {
        return sendError(
          res,
          500,
          "INTERNAL_ERROR",
          "Current scenario node could not be found for this attempt",
        );
      }

      let nextNodePort: string | undefined;
      let responsePayload: Prisma.InputJsonValue | undefined;
      let responseFeedback: string | null = null;

      switch (currentNode.type) {
        case "start":
        case "text":
        case "video":
          if (parsed.data.type !== "advance") {
            return sendError(
              res,
              400,
              "BAD_REQUEST",
              `Node ${currentNode.id} only supports an advance action`,
            );
          }
          break;
        case "choice": {
          if (parsed.data.type !== "answer_choice") {
            return sendError(
              res,
              400,
              "BAD_REQUEST",
              `Node ${currentNode.id} requires a choice answer`,
            );
          }

          const choiceAction = parsed.data;

          if (
            !currentNode.choices.some(
              (choice) => choice.id === choiceAction.choice_id,
            )
          ) {
            return sendError(
              res,
              400,
              "BAD_REQUEST",
              "Selected choice does not exist on the current node",
            );
          }

          nextNodePort = choiceAction.choice_id;
          responsePayload = {
            kind: "choice",
            choice_id: choiceAction.choice_id,
          } satisfies Prisma.InputJsonObject;
          break;
        }
        case "free_response": {
          if (parsed.data.type !== "answer_free_response") {
            return sendError(
              res,
              400,
              "BAD_REQUEST",
              `Node ${currentNode.id} requires a free response answer`,
            );
          }

          const freeResponseAction = parsed.data;

          if (!process.env.OPENAI_API_KEY) {
            return sendError(
              res,
              500,
              "INTERNAL_ERROR",
              "OPENAI_API_KEY is not set",
            );
          }

          try {
            const result = await gradeWithOpenAI(openai, {
              question_prompt: currentNode.prompt,
              user_response_text: freeResponseAction.answer_text,
              rubric: currentNode.rubric,
            });

            nextNodePort = result.bucket_id;
            responseFeedback = result.feedback;
            responsePayload = {
              kind: "free_response",
              answer_text: freeResponseAction.answer_text,
              bucket_id: result.bucket_id,
            } satisfies Prisma.InputJsonObject;
          } catch (error) {
            console.error(
              "Failed to grade free response during attempt progress",
              error,
            );
            return sendError(
              res,
              502,
              "INTERNAL_ERROR",
              "Failed to evaluate the free response",
            );
          }
          break;
        }
      }

      const resolvedNextNodeId = normalizeNextNodeId(
        scenario,
        getNextNodeIdForScenarioNode(currentNode, scenario.edges, nextNodePort),
      );

      const updatedAt = new Date();
      const result = await prisma.$transaction(async (tx) => {
        const updateResult = await tx.attempt.updateMany({
          where: {
            id: attempt.id,
            student_user_id: authedReq.auth.userId,
            status: "in_progress",
            current_node_id: currentNode.id,
          },
          data: resolvedNextNodeId
            ? {
                current_node_id: resolvedNextNodeId,
                last_activity_at: updatedAt,
              }
            : {
                current_node_id: null,
                last_activity_at: updatedAt,
                status: "submitted",
                submitted_at: updatedAt,
              },
        });

        if (updateResult.count !== 1) {
          return null;
        }

        if (typeof responsePayload !== "undefined") {
          await tx.response.upsert({
            where: {
              attempt_id_node_id: {
                attempt_id: attempt.id,
                node_id: currentNode.id,
              },
            },
            update: {
              response_payload: responsePayload,
              feedback: responseFeedback,
            },
            create: {
              attempt_id: attempt.id,
              node_id: currentNode.id,
              response_payload: responsePayload,
              feedback: responseFeedback,
            },
          });
        }

        const [updatedAttempt, savedResponse] = await Promise.all([
          tx.attempt.findFirst({
            where: { id: attempt.id },
            select: attemptSelect,
          }),
          typeof responsePayload !== "undefined"
            ? tx.response.findFirst({
                where: {
                  attempt_id: attempt.id,
                  node_id: currentNode.id,
                },
                select: responseSelect,
              })
            : Promise.resolve(null),
        ]);

        return {
          attempt: updatedAttempt,
          response: savedResponse,
        };
      });

      if (!result?.attempt) {
        return sendError(
          res,
          409,
          "BAD_REQUEST",
          "Attempt progress is out of sync. Reopen the assignment and try again.",
        );
      }

      return res.json({
        item: {
          attempt: mapAttemptRow(result.attempt),
          response: result.response
            ? mapResponseRow(result.response, true)
            : null,
          next_node_id: resolvedNextNodeId,
          completed: resolvedNextNodeId === null,
        },
      });
    } catch (error) {
      return sendInternalError(res, "Failed to update attempt progress", error);
    }
  });

  return router;
}
