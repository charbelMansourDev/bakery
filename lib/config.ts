/** Bakery-wide constants. Shared by server and client components. */

/**
 * WhatsApp number that the "Review Order" button opens, in international format,
 * digits only, no leading "+". Lebanon (+961) prefixed onto the bakery's local
 * number 71032883. Override per-environment with NEXT_PUBLIC_WHATSAPP_NUMBER.
 */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '96171032883';

export const BAKERY = {
  name: 'La Belle Fournée',
  tagline: 'Artisan Bakery',
  email: 'bonjour@labellefournee.com',
  phone: '+961 71 032 883',
  address: '18 Rue du Levain',
  footerTagline: 'Pre-Order • Freshly Baked • Limited Batches',
  legal: 'La Belle Fournée · Maison Dorée',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Our Story', href: '/#story' },
  { label: 'Have an Idea?', href: '/#have-an-idea' },
] as const;

/**
 * Photographs for the "Our Story" section. Drop files into public/images/ and
 * point these at them. An empty `src` renders a warm placeholder rather than a
 * broken image, so the layout holds up until the real photographs exist.
 *
 * Shoot/crop `primary` at 4:5 portrait and `secondary` at 3:4 — the section
 * reserves those ratios, so anything else gets cropped to fit.
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
