/** Bakery-wide constants. Shared by server and client components. */

/**
 * WhatsApp number that the "Review Order" button opens, in E.164: digits only,
 * no leading "+".
 *
 * The bakery's number is written locally as 03 229 666. The leading 0 is
 * Lebanon's national trunk prefix and is DROPPED when dialling internationally,
 * so the E.164 form is +961 3 229 666 -> 9613229666, not 96103229666. Keeping
 * the 0 would produce a wa.me link that resolves to nothing.
 *
 * Override per-environment with NEXT_PUBLIC_WHATSAPP_NUMBER.
 */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '9613229666';

export const BAKERY = {
  name: 'La Belle Fournée',
  tagline: 'Artisan Bakery',
  email: 'bonjour@labellefournee.com',
  phone: '+961 3 229 666',
  address: 'Main Road, Amioun',
  footerTagline: 'Pre-Order • Freshly Baked • Limited Batches',
  legal: 'La Belle Fournée · Maison Dorée',
  /** Instagram handle, without the @. The bakery has no other social accounts. */
  instagram: 'labellefournee',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Our Story', href: '/#story' },
  { label: 'Have an Idea?', href: '/#have-an-idea' },
] as const;

/**
 * Fallback photographs for the "Our Story" section.
 *
 * These are NOT the source of truth — the live images are managed in the CMS at
 * /admin/story and stored in MongoDB (see lib/story.ts). This is what renders
 * before anything has been saved, and what a fresh clone of the repo shows, so
 * the landing page never looks half-built.
 *
 * `primary` is cropped to 4:5 and `secondary` to 3:4 by the section.
 */
export const STORY_IMAGES = {
  primary: {
    src: '/images/story-shaping.jpg',
    alt: 'Shaping a sourdough loaf by hand on a flour-dusted bench',
  },
  secondary: {
    src: '/images/story-wrapping.jpg',
    alt: 'A finished loaf wrapped in paper and twine, ready for collection',
  },
} as const;
