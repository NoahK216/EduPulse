import express from 'express';
import type { Prisma } from '../../../prisma/generated/client.js';

import {
  getScenarioNode,
  ScenarioSchema,
} from '../../pages/scenario/scenarioSchemas.js';
import { prisma } from '../prisma.js';
import {
  asAuthedRequest,
  parseOptionalUuidQuery,
  parsePagination,
  parseUuidParam,
  sendError,
  sendInternalError,
} from './common.js';
import { accessibleResponseWhere } from './scopes.js';

export const responseSelect = {
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
            scenario_version: {
              select: {
                content: true,
              },
            },
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
    },
  },
} as const;

export function mapResponseRow(
  row: Awaited<
    ReturnType<
      typeof prisma.response.findFirst<{
        select: typeof responseSelect;
      }>
    >
  >,
  includePayload: boolean
) {
  if (!row) {
    return null;
  }

  const parsedScenario = ScenarioSchema.safeParse(
    row.attempt.assignment.scenario_version.content,
  );
  const node = parsedScenario.success
    ? getScenarioNode(parsedScenario.data, row.node_id)
    : null;
  const payload =
    row.response_payload && typeof row.response_payload === 'object'
      ? (row.response_payload as Record<string, unknown>)
      : null;
  const selectedChoiceId =
    payload?.kind === 'choice' && typeof payload.choice_id === 'string'
      ? payload.choice_id
      : null;
  const selectedChoiceLabel =
    node?.type === 'choice'
      ? node.choices.find((choice) => choice.id === selectedChoiceId)?.label ?? null
      : null;
  const answerText =
    payload?.kind === 'free_response' && typeof payload.answer_text === 'string'
      ? payload.answer_text
      : null;
  const promptText =
    node?.type === 'choice' || node?.type === 'free_response' ? node.prompt : null;
  const choiceOptions =
    node?.type === 'choice'
      ? node.choices.map((choice) => ({
          id: choice.id,
          label: choice.label,
        }))
      : null;

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
    student_name: row.attempt.student.auth_user.name,
    student_email: row.attempt.student.auth_user.email,
    node_type: node?.type ?? null,
    node_title: node?.title ?? null,
    prompt_text: promptText,
    choice_options: choiceOptions,
    selected_choice_id: selectedChoiceId,
    selected_choice_label: selectedChoiceLabel,
    answer_text: answerText,
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

    const attemptId = parseOptionalUuidQuery(req.query, 'attemptId');
    if (!attemptId.ok) {
      return sendError(res, 400, 'BAD_REQUEST', attemptId.message);
    }

    const where: Prisma.responseWhereInput = accessibleResponseWhere(
      authedReq.auth.userId
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
          select: responseSelect,
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
    const id = parseUuidParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    try {
      const row = await prisma.response.findFirst({
        where: {
          AND: [{ id: id.value }, accessibleResponseWhere(authedReq.auth.userId)],
        },
        select: responseSelect,
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
