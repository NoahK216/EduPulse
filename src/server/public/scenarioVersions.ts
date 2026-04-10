import express from 'express';
import type { Prisma } from '../../../prisma/generated/client.js';

import { prisma } from '../prisma.js';
import {
  asAuthedRequest,
  parseOptionalUuidQuery,
  parsePagination,
  sendError,
  sendInternalError,
} from './common.js';

const scenarioVersionSelect = {
  id: true,
  scenario_id: true,
  version_number: true,
  title: true,
  published_by_user_id: true,
  published_at: true,
  scenario: { select: { title: true } },
  _count: { select: { assignments: true } },
} as const;

function mapScenarioVersionRow(
  row: Awaited<
    ReturnType<
      typeof prisma.scenario_version.findFirst<{
        select: typeof scenarioVersionSelect;
      }>
    >
  >
) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    scenario_id: row.scenario_id,
    version_number: row.version_number,
    title: row.title,
    published_by_user_id: row.published_by_user_id,
    published_at: row.published_at,
    scenario_title: row.scenario.title,
    assignment_count: row._count.assignments,
  };
}

export function createPublicScenarioVersionsRouter() {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const authedReq = asAuthedRequest(req);
    const pagination = parsePagination(req.query);
    if (!pagination.ok) {
      return sendError(res, 400, 'BAD_REQUEST', pagination.message);
    }

    const scenarioId = parseOptionalUuidQuery(req.query, 'scenarioId');
    if (!scenarioId.ok) {
      return sendError(res, 400, 'BAD_REQUEST', scenarioId.message);
    }

    const where: Prisma.scenario_versionWhereInput = {
      scenario: { owner_user_id: authedReq.auth.userId },
    };
    if (scenarioId.value !== undefined) {
      where.scenario_id = scenarioId.value;
    }

    const { page, pageSize, skip, take } = pagination.value;

    try {
      const [total, rows] = await Promise.all([
        prisma.scenario_version.count({ where }),
        prisma.scenario_version.findMany({
          where,
          orderBy: [{ published_at: 'desc' }, { id: 'desc' }],
          skip,
          take,
          select: scenarioVersionSelect,
        }),
      ]);

      return res.json({
        items: rows.map((row) => mapScenarioVersionRow(row)),
        page,
        pageSize,
        total,
      });
    } catch (error) {
      return sendInternalError(res, 'Failed to list scenario versions', error);
    }
  });

  return router;
}
