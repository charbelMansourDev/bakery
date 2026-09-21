import { NextResponse } from 'next/server';
import { readUpload } from '@/lib/uploads';

/** Serves files from ./uploads. See lib/uploads.ts for why not public/uploads. */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const file = await readUpload(segments ?? []);
  if (!file) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  return new NextResponse(new Uint8Array(file.body), {
    headers: {
      'Content-Type': file.contentType,
      // Filenames are UUIDs, so a stored image never changes under its own URL.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
