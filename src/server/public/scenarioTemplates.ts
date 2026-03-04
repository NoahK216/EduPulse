import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';

import { sendInternalError } from './common.js';

type ScenarioTemplateItem = {
  id: string;
  file_name: string;
  title: string;
  url: string;
};

const TEMPLATE_DIRECTORIES = [
  path.resolve(process.cwd(), 'public', 'scenarios'),
  path.resolve(process.cwd(), 'dist', 'scenarios'),
];

async function findTemplateDirectory() {
  for (const directory of TEMPLATE_DIRECTORIES) {
    try {
      const stat = await fs.stat(directory);
      if (stat.isDirectory()) {
        return directory;
      }
    } catch {
      // Try the next candidate directory.
    }
  }

  return null;
}

function fallbackTitle(fileName: string) {
  const base = path.basename(fileName, '.json');
  return base.replace(/[-_]+/g, ' ').trim() || base;
}

async function readTemplateTitle(filePath: string, fileName: string) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as { title?: unknown };
    if (typeof parsed.title === 'string' && parsed.title.trim().length > 0) {
      return parsed.title.trim();
    }
  } catch {
    // Fall back to deriving a title from the file name.
  }

  return fallbackTitle(fileName);
}

export function createPublicScenarioTemplatesRouter() {
  const router = express.Router();

  router.get('/', async (_req, res) => {
    try {
      const templateDirectory = await findTemplateDirectory();
      if (!templateDirectory) {
        return res.json({ items: [] });
      }

      const entries = await fs.readdir(templateDirectory, { withFileTypes: true });
      const jsonFiles = entries
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
        .sort((a, b) => a.name.localeCompare(b.name));

      const items = await Promise.all(
        jsonFiles.map(async (entry): Promise<ScenarioTemplateItem> => {
          const fileName = entry.name;
          const filePath = path.join(templateDirectory, fileName);
          const title = await readTemplateTitle(filePath, fileName);

          return {
            id: path.basename(fileName, '.json'),
            file_name: fileName,
            title,
            url: `/scenarios/${encodeURIComponent(fileName)}`,
          };
        }),
      );

      return res.json({ items });
    } catch (error) {
      return sendInternalError(res, 'Failed to list scenario templates', error);
    }
  });

  return router;
}
