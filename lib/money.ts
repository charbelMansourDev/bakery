/**
 * Money helpers. Prices are integer CENTS everywhere — in the database, in the
 * DTOs and in the cart. Dollars only ever exist as a formatted string for
 * display, or as raw input in the admin form.
 *
 * Not marked `server-only`: client components need to format prices too.
 */

/**
 * Format cents for display. Two decimals by default, because that is what a
 * price normally looks like ("$8.00", "+$2.00"). Pass { compact: true } for the
 * base-loaf headline price, which the design shows as a bare "$4".
 */
export function formatCents(
  cents: number,
  opts: { signed?: boolean; compact?: boolean } = {},
): string {
  const dropCents = opts.compact === true && cents % 100 === 0;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: dropCents ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);

  return opts.signed ? `+${formatted}` : formatted;
}

/** True when a dollars string is a valid price, e.g. "4", "4.5", "4.50". */
export const DOLLARS_PATTERN = /^\d+(\.\d{1,2})?$/;

/**
 * Convert a dollars string to integer cents.
 *
 * `Math.round` is load-bearing: `4.10 * 100 === 410.00000000000006` and
 * `1.15 * 100 === 114.99999999999999`, so truncating would silently lose a cent.
 * Validate against DOLLARS_PATTERN first so "4.999" is rejected, not rounded.
 */
export function dollarsToCents(dollars: string | number): number {
  return Math.round(Number(dollars) * 100);
}

/** Inverse of dollarsToCents, for pre-filling the admin form. */
export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}
