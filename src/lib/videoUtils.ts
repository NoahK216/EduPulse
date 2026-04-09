/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // Support formats:
  // https://youtube.com/watch?v=ID
  // https://www.youtube.com/watch?v=ID
  // https://youtu.be/ID
  // https://www.youtube.com/embed/ID
  // youtube.com/watch?v=ID (no protocol)
  // youtu.be/ID (no protocol)

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

/**
 * Generate a safe filename from an original filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove special characters, keep only alphanumeric, dashes, underscores, and dots
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique filename with timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  const sanitized = sanitizeFilename(originalFilename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  const nameParts = sanitized.split('.');
  const ext = nameParts.length > 1 ? `.${nameParts.pop()}` : '';
  const baseName = nameParts.join('.');
  
  return `${baseName}-${timestamp}-${random}${ext}`;
}

/**
 * Validate video file by extension
 */
export function isValidVideoFile(filename: string): boolean {
  const validExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.mkv', '.avi', '.flv'];
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return validExtensions.includes(ext);
}
