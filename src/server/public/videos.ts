import express from 'express';
import { promisify } from 'util';
import { mkdir } from 'fs';
import { join } from 'path';
import multer from 'multer';

import { requireSession } from './auth.js';
import { sendError, sendInternalError } from './common.js';

const mkdirAsync = promisify(mkdir);

// Upload directory - videos stored in public/uploads/videos
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads', 'videos');
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await mkdirAsync(UPLOADS_DIR, { recursive: true });
      cb(null, UPLOADS_DIR);
    } catch (error) {
      cb(error as Error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.originalname.split('.').pop();
    cb(null, `video-${timestamp}-${random}.${ext}`);
  },
});

const fileFilter = (
  req: express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export function createPublicVideosRouter() {
  const router = express.Router();

  router.use(requireSession);

  // POST /api/public/videos/upload - Upload a video file
  router.post('/upload', upload.single('video'), async (req, res) => {
    if (!req.file) {
      return sendError(res, 400, 'BAD_REQUEST', 'No video file provided');
    }

    try {
      const relativeUrl = `/uploads/videos/${req.file.filename}`;
      
      return res.json({
        url: relativeUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      return sendInternalError(res, 'Failed to upload video', error);
    }
  });

  // POST /api/public/videos/validate-youtube - Validate YouTube URL
  router.post('/validate-youtube', async (req, res) => {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return sendError(res, 400, 'BAD_REQUEST', 'YouTube URL is required');
    }

    // Simple YouTube ID extraction and validation
    const youtubeIdPattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeIdPattern);

    if (!match || !match[1]) {
      return sendError(res, 400, 'BAD_REQUEST', 'Invalid YouTube URL');
    }

    try {
      const youtubeId = match[1];
      
      return res.json({
        valid: true,
        youtubeId,
        embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      });
    } catch (error) {
      return sendInternalError(res, 'Failed to validate YouTube URL', error);
    }
  });

  return router;
}
