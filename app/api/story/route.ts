import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '@/lib/auth';
import { getStory, updateStory } from '@/lib/story';
import { storyUpdateSchema } from '@/lib/validation';

/** Public: the story photographs as currently published. */
export async function GET() {
  try {
    return NextResponse.json({ story: await getStory() });
  } catch {
    return NextResponse.json({ error: 'Could not load the story.' }, { status: 500 });
  }
}

/** Admin only. */
export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const parsed = storyUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid story content.' },
      { status: 400 },
    );
  }

  const story = await updateStory(parsed.data);
  revalidatePath('/');
  return NextResponse.json({ story });
}
