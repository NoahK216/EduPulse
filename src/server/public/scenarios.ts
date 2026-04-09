import express from 'express';
import { z } from 'zod';
import type { Prisma } from '../../../prisma/generated/client.js';

import { prisma } from '../prisma.js';
import {
  asAuthedRequest,
  parsePagination,
  parseUuidParam,
  sendError,
  sendInternalError,
} from './common.js';

const syncScenarioBodySchema = z.object({
  scenario_id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(4000).nullable().optional(),
  draft_content: z.unknown(),
});

const scenarioListSelect = {
  id: true,
  owner_user_id: true,
  title: true,
  description: true,
  latest_version_number: true,
  created_at: true,
  updated_at: true,
  owner: {
    select: {
      auth_user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  },
  _count: { select: { versions: true } },
} as const;

const scenarioDetailSelect = {
  ...scenarioListSelect,
  draft_content: true,
} as const;

function toJsonInput(value: unknown): {
  ok: true;
  value: Prisma.InputJsonValue;
} | {
  ok: false;
  message: string;
} {
  try {
    const normalized = JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
    return { ok: true, value: normalized };
  } catch {
    return {
      ok: false,
      message: 'draft_content must be valid JSON-serializable data',
    };
  }
}

function mapScenarioRow(
  row: Awaited<
    ReturnType<
      typeof prisma.scenario.findFirst<{
        select: typeof scenarioListSelect;
      }>
    >
  >
) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    owner_user_id: row.owner_user_id,
    title: row.title,
    description: row.description,
    latest_version_number: row.latest_version_number,
    created_at: row.created_at,
    updated_at: row.updated_at,
    owner_name: row.owner.auth_user.name,
    owner_email: row.owner.auth_user.email,
    version_count: row._count.versions,
  };
}

function mapScenarioDetailRow(
  row: Awaited<
    ReturnType<
      typeof prisma.scenario.findFirst<{
        select: typeof scenarioDetailSelect;
      }>
    >
  >
) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    owner_user_id: row.owner_user_id,
    title: row.title,
    description: row.description,
    draft_content: row.draft_content,
    latest_version_number: row.latest_version_number,
    created_at: row.created_at,
    updated_at: row.updated_at,
    owner_name: row.owner.auth_user.name,
    owner_email: row.owner.auth_user.email,
    version_count: row._count.versions,
  };
}

export function createPublicScenariosRouter() {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const pagination = parsePagination(req.query);
    if (!pagination.ok) {
      return sendError(res, 400, 'BAD_REQUEST', pagination.message);
    }

    const where = { owner_user_id: authedReq.auth.publicUserId };
    const { page, pageSize, skip, take } = pagination.value;

    try {
      const [total, rows] = await Promise.all([
        prisma.scenario.count({ where }),
        prisma.scenario.findMany({
          where,
          orderBy: { updated_at: 'desc' },
          skip,
          take,
          select: scenarioListSelect,
        }),
      ]);

      return res.json({
        items: rows.map((row) => mapScenarioRow(row)),
        page,
        pageSize,
        total,
      });
    } catch (error) {
      return sendInternalError(res, 'Failed to list scenarios', error);
    }
  });

  router.get('/:id', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseUuidParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    try {
      const row = await prisma.scenario.findFirst({
        where: {
          id: id.value,
          owner_user_id: authedReq.auth.publicUserId,
        },
        select: scenarioDetailSelect,
      });

      const item = mapScenarioDetailRow(row);
      if (!item) {
        return sendError(res, 404, 'NOT_FOUND', 'Scenario not found');
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, 'Failed to fetch scenario', error);
    }
  });

  router.delete('/:id', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const id = parseUuidParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    try {
      const where = {
        id: id.value,
        owner_user_id: authedReq.auth.publicUserId,
      } satisfies Prisma.scenarioWhereInput;
      const [existing, assignedVersion] = await Promise.all([
        prisma.scenario.findFirst({
          where,
          select: {
            id: true,
          },
        }),
        prisma.scenario_version.findFirst({
          where: {
            scenario_id: id.value,
            scenario: {
              owner_user_id: authedReq.auth.publicUserId,
            },
            assignments: {
              some: {},
            },
          },
          select: {
            id: true,
          },
        }),
      ]);

      if (!existing) {
        return sendError(res, 404, 'NOT_FOUND', 'Scenario not found');
      }

      if (assignedVersion) {
        return sendError(
          res,
          400,
          'BAD_REQUEST',
          'Cannot delete a scenario with assigned published versions'
        );
      }

      await prisma.scenario.delete({
        where: { id: existing.id },
      });

      return res.json({
        deleted: true,
        id: existing.id,
      });
    } catch (error) {
      return sendInternalError(res, 'Failed to delete scenario', error);
    }
  });

  router.post('/', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const parsed = syncScenarioBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Invalid request body',
        details: parsed.error.flatten(),
      });
    }

    const jsonDraft = toJsonInput(parsed.data.draft_content);
    if (!jsonDraft.ok) {
      return sendError(res, 400, 'BAD_REQUEST', jsonDraft.message);
    }

    const title = parsed.data.title;
    const description =
      parsed.data.description && parsed.data.description.length > 0
        ? parsed.data.description
        : null;
    const scenarioId = parsed.data.scenario_id;

    try {
      let savedId: string;

      if (scenarioId) {
        const existing = await prisma.scenario.findFirst({
          where: {
            id: scenarioId,
            owner_user_id: authedReq.auth.publicUserId,
          },
          select: { id: true },
        });

        if (!existing) {
          return sendError(res, 404, 'NOT_FOUND', 'Scenario not found');
        }

        const updated = await prisma.scenario.update({
          where: { id: existing.id },
          data: {
            title,
            description,
            draft_content: jsonDraft.value,
            updated_at: new Date(),
          },
          select: { id: true },
        });
        savedId = updated.id;
      } else {
        const created = await prisma.scenario.create({
          data: {
            owner_user_id: authedReq.auth.publicUserId,
            title,
            description,
            draft_content: jsonDraft.value,
            latest_version_number: 0,
            updated_at: new Date(),
          },
          select: { id: true },
        });
        savedId = created.id;
      }

      const row = await prisma.scenario.findFirst({
        where: {
          id: savedId,
          owner_user_id: authedReq.auth.publicUserId,
        },
        select: scenarioDetailSelect,
      });

      const item = mapScenarioDetailRow(row);
      if (!item) {
        return sendError(res, 500, 'INTERNAL_ERROR', 'Scenario saved but could not be loaded');
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, 'Failed to sync scenario draft', error);
    }
  });

  return router;
}
