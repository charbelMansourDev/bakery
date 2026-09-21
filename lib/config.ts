/** Bakery-wide constants. Shared by server and client components. */

/**
 * WhatsApp number that the "Review Order" button opens, in international format,
 * digits only, no leading "+". Supplied as the local number 71032883; Lebanon
 * (+961) is assumed. Change this one line if the country code is different.
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
