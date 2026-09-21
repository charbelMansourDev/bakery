import 'server-only';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { put } from '@vercel/blob';

/**
 * Two storage backends behind one function, chosen by environment:
 *
 * - Vercel Blob when BLOB_READ_WRITE_TOKEN is set (i.e. on Vercel). Its
 *   filesystem is ephemeral, so anything written to disk there is gone on the
 *   next deploy — uploads have to leave the container.
 * - The local ./uploads directory otherwise, served by GET /api/media, so
 *   `npm run dev` works with no Blob store and no token.
 *
 * Why ./uploads and not public/uploads for the local path: Next indexes the
 * public folder at boot in production and caches negative lookups, so a file
 * written there after startup 404s under `next build && next start` until the
 * server restarts, while working fine in `next dev`. A route handler behaves
 * identically in both.
 *
 * `imageUrl` therefore holds one of three shapes, and every reader must cope:
 *   /images/classic.jpg                      seeded, static
 *   /api/media/<uuid>.jpg                    uploaded locally
 *   https://<store>.public.blob.vercel-storage.com/<uuid>.jpg   uploaded on Vercel
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

/** True when uploads go to Vercel Blob rather than the local disk. */
export function usingBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Duck-typed so it works whether FormData yields a File or a Blob. */
export function asUploadedFile(value: unknown): UploadedFile | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<UploadedFile>;
  if (typeof candidate.arrayBuffer !== 'function') return null;
  if (typeof candidate.type !== 'string' || typeof candidate.size !== 'number') return null;
  return candidate as UploadedFile;
}

/** Saves the upload and returns the URL to store in `imageUrl`. */
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

  const filename = `${randomUUID()}.${ext}`;

  if (usingBlobStorage()) {
    const { url } = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
      // The filename is already a UUID; a random suffix would only make the
      // stored path differ from what we asked for.
      addRandomSuffix: false,
    });
    return url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/api/media/${filename}`;
}

/** Reads a locally-stored upload, refusing anything that escapes the uploads dir. */
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
