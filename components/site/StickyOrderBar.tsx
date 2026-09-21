'use client';

import { useCart, type CartLine } from '@/lib/cart-context';
import { WHATSAPP_NUMBER } from '@/lib/config';
import { formatCents } from '@/lib/money';
import type { ProductDTO } from '@/types/product';

function buildOrderMessage(base: ProductDTO | null, addOns: CartLine[], totalCents: number) {
  const lines = ['Hello La Belle Fournée! I would like to pre-order:', ''];

  if (base) lines.push(`Loaf: ${base.name} (${formatCents(base.price, { compact: true })})`);

  if (addOns.length > 0) {
    lines.push(base ? 'Folded in:' : 'Add-ons:');
    for (const { product, qty } of addOns) {
      // Send the line total — that is the number the bakery needs to read.
      const lineTotal = formatCents(product.price * qty, { signed: true });
      lines.push(qty > 1 ? `- ${product.name} x${qty} (${lineTotal})` : `- ${product.name} (${lineTotal})`);
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
  const { base, addOns, isEmpty, totalCents, removeItem, clear } = useCart();

  if (isEmpty) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    buildOrderMessage(base, addOns, totalCents),
  )}`;

  const tags = [
    ...(base ? [{ id: base.id, label: base.name }] : []),
    ...addOns.map(({ product, qty }) => ({
      id: product.id,
      label: qty > 1 ? `${product.name} ×${qty}` : product.name,
    })),
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/40 bg-cream-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-10">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <span className="eyebrow shrink-0 text-walnut-400">Your order</span>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => removeItem(tag.id)}
              aria-label={`Remove ${tag.label}`}
              className="group flex items-center gap-1.5 rounded-full border border-walnut/25 px-3 py-1 text-xs text-walnut transition hover:border-walnut hover:bg-walnut/5"
            >
              {tag.label}
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
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-gold px-6 py-3 text-sm font-semibold tracking-wide text-walnut transition hover:bg-gold-300"
          >
            Review Order
          </a>
        </div>
      </div>
    </div>
  );
}
