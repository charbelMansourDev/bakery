import StoryForm from '@/components/admin/StoryForm';
import { requireAdmin } from '@/lib/auth';
import { getStory } from '@/lib/story';

export const dynamic = 'force-dynamic';

export default async function StoryAdminPage() {
  await requireAdmin();
  const story = await getStory();

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Our Story</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        The two photographs beside the story on the landing page.
      </p>

      <StoryForm story={story} />
    </div>
  );
}
