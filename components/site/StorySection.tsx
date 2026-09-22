import { STORY_IMAGES } from '@/lib/config';
import SectionDivider from './SectionDivider';
import StoryImage from './StoryImage';

/**
 * Our Story: an editorial two-column band built around photographs of the
 * baker at work. The images are offset rather than aligned into a neat grid —
 * a deliberate asymmetry that reads as a scrapbook rather than a product shot.
 *
 * No absolute positioning: the offset is a top margin on the second column, so
 * nothing can overflow into the sections above or below at any width.
 */
export default function StorySection() {
  return (
    <section id="story" className="bg-walnut text-cream">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Photographs */}
          <div className="grid grid-cols-5 gap-4 sm:gap-5">
            <div className="relative col-span-3 aspect-4/5 overflow-hidden rounded-xl ring-1 ring-gold/25">
              <StoryImage
                src={STORY_IMAGES.primary.src}
                alt={STORY_IMAGES.primary.alt}
                sizes="(min-width: 1024px) 28vw, 55vw"
              />
            </div>

            {/* Dropped down so the pair sits off the horizontal. */}
            <div className="relative col-span-2 mt-10 aspect-3/4 self-start overflow-hidden rounded-xl ring-1 ring-gold/25 sm:mt-14">
              <StoryImage
                src={STORY_IMAGES.secondary.src}
                alt={STORY_IMAGES.secondary.alt}
                sizes="(min-width: 1024px) 19vw, 37vw"
              />
            </div>
          </div>

          {/* Copy */}
          <div>
            <p className="eyebrow text-gold">Our Story</p>
            <h2 className="mt-4 font-display text-4xl lg:text-5xl">Flour, water, salt, time.</h2>

            <p className="mt-6 font-display text-lg italic leading-relaxed text-cream/80">
              We keep one starter, fed every morning since the day we opened. Every loaf is mixed
              by hand, rested overnight, and baked at dawn in small batches.
            </p>
            <p className="mt-4 font-display text-lg italic leading-relaxed text-cream/80">
              Each pre-order is shaped for the person who asked for it, then wrapped by hand before
              it leaves the kitchen. That is why we bake to order, and why there is never quite
              enough.
            </p>

            <div className="mt-10">
              <SectionDivider full={false} className="mx-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
