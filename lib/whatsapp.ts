import { BAKERY, WHATSAPP_NUMBER } from './config';
import { formatCents } from './money';
import type { CartLineDTO } from '@/types/cart';

/**
 * Everything the site sends to the bakery goes through WhatsApp: there is no
 * checkout and no inbox. Not marked `server-only` — the order bar and the idea
 * form are client components.
 */

export function whatsappUrl(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * One line per item, in the bakery's own notation:
 *
 *   - Multigrain $2.00 + Classic $4 = $6.00
 *   - Classic $4 (plain)
 */
function describeLine(line: CartLineDTO): string {
  const loaf = `${line.base.name} ${formatCents(line.base.price, { compact: true })}`;
  if (!line.addOn) return `- ${loaf} (plain)`;
  return `- ${line.addOn.name} ${formatCents(line.addOn.price)} + ${loaf} = ${formatCents(line.totalCents)}`;
}

export function buildIdeaMessage(idea: string): string {
  return [`Hello ${BAKERY.name}! I have a flavor idea for a sourdough:`, '', idea.trim()].join('\n');
}

export function buildOrderMessage(lines: CartLineDTO[], totalCents: number): string {
  return [
    `Hello ${BAKERY.name}! I would like to pre-order:`,
    '',
    ...lines.map(describeLine),
    '',
    `Total: ${formatCents(totalCents)}`,
  ].join('\n');
}
