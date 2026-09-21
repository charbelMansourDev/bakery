import 'server-only';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Uploaded images are written to ./uploads (outside public/) and served by
 * GET /api/media/[...path].
 *
 * Why not public/uploads, as is conventional? In next@15.5 the public-folder
 * index is a boot-time directory scan (guarded by `if (!opts.dev)`) with
 * negative lookups LRU-cached, so a file written there after startup 404s under
 * `next build && next start` until the server restarts — while working fine in
 * `next dev`. A route handler behaves identically in both.
 */

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_BYTES = 4 * 1024 * 1024;

/** Extension is derived from the sniffed mime, never from the client filename. */
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export class UploadError extends Error {}

type UploadedFile = { arrayBuffer(): Promise<ArrayBuffer>; type: string; size: number };

/** Duck-typed so it works whether FormData yields a File or a Blob. */
export function asUploadedFile(value: unknown): UploadedFile | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<UploadedFile>;
  if (typeof candidate.arrayBuffer !== 'function') return null;
  if (typeof candidate.type !== 'string' || typeof candidate.size !== 'number') return null;
  return candidate as UploadedFile;
}

/** Saves the upload and returns the public URL to store in `imageUrl`. */
export async function saveUpload(file: UploadedFile): Promise<string> {
  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    throw new UploadError('Unsupported file type. Use a JPEG, PNG or WebP image.');
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError('Image is too large. The limit is 4 MB.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // Re-check after reading: `size` is client-reported metadata until now.
  if (buffer.byteLength > MAX_BYTES) {
    throw new UploadError('Image is too large. The limit is 4 MB.');
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/api/media/${filename}`;
}

/** Reads an uploaded file, refusing anything that escapes the uploads dir. */
export async function readUpload(
  segments: string[],
): Promise<{ body: Buffer; contentType: string } | null> {
  if (segments.length !== 1) return null;

  const [name] = segments;
  if (!name || name.includes('/') || name.includes('\\') || name.includes('..')) return null;

  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const contentType = EXT_TO_MIME[ext];
  if (!contentType) return null;

  // Resolve first, then verify the result is still inside UPLOAD_DIR.
  const target = path.resolve(UPLOAD_DIR, name);
  if (target !== path.join(UPLOAD_DIR, name)) return null;
  if (!target.startsWith(UPLOAD_DIR + path.sep)) return null;

  try {
    return { body: await readFile(target), contentType };
  } catch {
    return null;
  }
}

export { MAX_BYTES };
