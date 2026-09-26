import { getStory } from '@/lib/story';
import SectionDivider from './SectionDivider';
import StoryImage from './StoryImage';

/**
 * Our Story: an editorial two-column band built around photographs of the
 * baker at work. The images are offset rather than aligned into a neat grid —
 * a deliberate asymmetry that reads as a scrapbook rather than a product shot.
 *
 * No absolute positioning: the offset is a top margin on the second column, so
 * nothing can overflow into the sections above or below at any width.
 *
 * Both photographs come from the CMS; lib/story.ts falls back to the defaults
 * in lib/config.ts when nothing has been saved yet.
 */
export default async function StorySection() {
  const story = await getStory();

  return (
    <section id="story" className="bg-walnut text-cream">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Photographs */}
          <div className="grid grid-cols-5 gap-4 sm:gap-5">
            <div className="relative col-span-3 aspect-4/5 overflow-hidden rounded-xl ring-1 ring-gold/25">
              <StoryImage
                src={story.primary.url}
                alt={story.primary.alt}
                sizes="(min-width: 1024px) 28vw, 55vw"
              />
            </div>

            {/* Dropped down so the pair sits off the horizontal. */}
            <div className="relative col-span-2 mt-10 aspect-3/4 self-start overflow-hidden rounded-xl ring-1 ring-gold/25 sm:mt-14">
              <StoryImage
                src={story.secondary.url}
                alt={story.secondary.alt}
                sizes="(min-width: 1024px) 19vw, 37vw"
              />
            </div>
          </div>

          {/* Copy */}
          <div>
            <p className="eyebrow text-gold">Our Story</p>
            <h2 className="mt-4 font-display text-4xl lg:text-5xl">{story.heading}</h2>

            {/* Edited in the CMS as plain text: a blank line starts a new paragraph. */}
            {story.body
              .split(/\n\s*\n/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, index) => (
                <p
                  key={index}
                  className={`${index === 0 ? 'mt-6' : 'mt-4'} font-display text-lg italic leading-relaxed text-cream/80`}
                >
                  {paragraph}
                </p>
              ))}

            <div className="mt-10">
              <SectionDivider full={false} className="mx-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
