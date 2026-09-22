'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import ChooseLoafDialog from './ChooseLoafDialog';
import { WHATSAPP_NUMBER } from '@/lib/config';
import { formatCents } from '@/lib/money';
import type { ProductDTO } from '@/types/product';

function buildOrderMessage(base: ProductDTO | null, addOns: ProductDTO[], totalCents: number) {
  const lines = ['Hello La Belle Fournée! I would like to pre-order:', ''];

  if (base) lines.push(`Loaf: ${base.name} (${formatCents(base.price, { compact: true })})`);

  if (addOns.length > 0) {
    lines.push(base ? 'Folded in:' : 'Add-ons:');
    for (const addOn of addOns) {
      lines.push(`- ${addOn.name} (${formatCents(addOn.price, { signed: true })})`);
    }
  }

  lines.push('', `Total: ${formatCents(totalCents)}`);
  return lines.join('\n');
}

/**
 * Visual cart summary only — there is no checkout. "Review Order" hands the
 * order to WhatsApp so the customer can confirm it with the bakery directly.
 */
export default function StickyOrderBar() {
  const { base, addOns, items, isEmpty, totalCents, removeItem, clear } = useCart();
  const [needsLoaf, setNeedsLoaf] = useState(false);

  if (isEmpty) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    buildOrderMessage(base, addOns, totalCents),
  )}`;

  return (
    <>
      {/* The dialog is a SIBLING of this bar, not a child: `backdrop-blur`
          establishes a containing block for fixed-position descendants, so a
          dialog nested inside would position against the bar rather than the
          viewport and hang off the bottom of the screen. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/40 bg-cream-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-10">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <span className="eyebrow shrink-0 text-walnut-400">Your order</span>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.name}`}
                className="group flex items-center gap-1.5 rounded-full border border-walnut/25 px-3 py-1 text-xs text-walnut transition hover:border-walnut hover:bg-walnut/5"
              >
                {item.name}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3 w-3 text-walnut-400 transition group-hover:text-walnut"
                >
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            ))}
            <button
              type="button"
              onClick={clear}
              className="text-xs text-walnut-400 underline underline-offset-4 transition hover:text-walnut"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center justify-between gap-5 lg:justify-end">
            <p className="font-display text-lg text-walnut">
              Total <span className="ml-1 text-gold">{formatCents(totalCents)}</span>
            </p>
            {/* Without a base loaf there is no order to place, so the handoff to
                WhatsApp is replaced by a prompt rather than left to produce an
                order the bakery would have to correct by hand. */}
            {base ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gold px-6 py-3 text-sm font-semibold tracking-wide text-walnut transition hover:bg-gold-300"
              >
                Review Order
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setNeedsLoaf(true)}
                className="rounded-lg bg-gold px-6 py-3 text-sm font-semibold tracking-wide text-walnut transition hover:bg-gold-300"
              >
                Review Order
              </button>
            )}
        </div>
        </div>
      </div>

      <ChooseLoafDialog open={needsLoaf} onClose={() => setNeedsLoaf(false)} />
    </>
  );
}
