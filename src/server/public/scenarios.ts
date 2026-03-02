import express from 'express';

import { prisma } from '../prisma.js';
import {
  asAuthedRequest,
  parseIntParam,
  parsePagination,
  sendError,
  sendInternalError,
} from './common.js';

function mapScenarioRow(
  row: Awaited<
    ReturnType<
      typeof prisma.scenario.findFirst<{
        select: {
          id: true;
          owner_user_id: true;
          title: true;
          description: true;
          latest_version_number: true;
          created_at: true;
          updated_at: true;
          owner: { select: { name: true; email: true } };
          _count: { select: { versions: true } };
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
    owner_user_id: row.owner_user_id,
    title: row.title,
    description: row.description,
    latest_version_number: row.latest_version_number,
    created_at: row.created_at,
    updated_at: row.updated_at,
    owner_name: row.owner.name,
    owner_email: row.owner.email,
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
          select: {
            id: true,
            owner_user_id: true,
            title: true,
            description: true,
            latest_version_number: true,
            created_at: true,
            updated_at: true,
            owner: { select: { name: true, email: true } },
            _count: { select: { versions: true } },
          },
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
    const id = parseIntParam('id', req.params.id);
    if (!id.ok) {
      return sendError(res, 400, 'BAD_REQUEST', id.message);
    }

    try {
      const row = await prisma.scenario.findFirst({
        where: {
          id: id.value,
          owner_user_id: authedReq.auth.publicUserId,
        },
        select: {
          id: true,
          owner_user_id: true,
          title: true,
          description: true,
          latest_version_number: true,
          created_at: true,
          updated_at: true,
          owner: { select: { name: true, email: true } },
          _count: { select: { versions: true } },
        },
      });

      const item = mapScenarioRow(row);
      if (!item) {
        return sendError(res, 404, 'NOT_FOUND', 'Scenario not found');
      }

      return res.json({ item });
    } catch (error) {
      return sendInternalError(res, 'Failed to fetch scenario', error);
    }
  });

  return router;
}
