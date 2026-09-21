import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { asUploadedFile, saveUpload, UploadError } from '@/lib/uploads';

/**
 * `formidable` is unusable here: it needs a Node IncomingMessage stream, while
 * App Router handlers receive a Web Request. `request.formData()` is the
 * supported path, and no `bodyParser` config is needed (that was Pages Router).
 */
export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected a multipart form upload.' }, { status: 400 });
  }

  const file = asUploadedFile(formData.get('file'));
  if (!file) {
    return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
  }

  try {
    const url = await saveUpload(file);
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
