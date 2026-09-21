'use client';

import { useCart } from '@/lib/cart-context';
import { formatCents } from '@/lib/money';
import type { ProductDTO } from '@/types/product';
import ProductImage from './ProductImage';

/**
 * Grid card for a savory or sweet add-on. The first tap adds one; after that
 * the button becomes a stepper so an order can carry two olive or three
 * chocolate. Stepping below one removes the add-on again.
 */
export default function AddOnCard({ product }: { product: ProductDTO }) {
  const { addAddOn, removeOneAddOn, qtyOf } = useCart();
  const qty = qtyOf(product.id);

  return (
    <article className="group overflow-hidden rounded-xl bg-cream-50 shadow-soft transition hover:shadow-soft-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
        />
      </div>

      <div className="p-5">
        <h3 className="font-display text-xl text-walnut">{product.name}</h3>
        <p className="mt-1 font-display text-sm italic text-walnut-400">{product.description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-display text-base text-gold">
            {formatCents(product.price, { signed: true })}
            {qty > 1 && (
              <span className="ml-2 text-sm text-walnut-400">
                {formatCents(product.price * qty, { signed: true })} total
              </span>
            )}
          </p>

          {qty === 0 ? (
            <button
              type="button"
              onClick={() => addAddOn(product)}
              aria-label={`Add ${product.name}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-walnut transition hover:bg-gold-300"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
          ) : (
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-walnut p-1 text-cream">
              <button
                type="button"
                onClick={() => removeOneAddOn(product)}
                aria-label={
                  qty === 1 ? `Remove ${product.name}` : `Remove one ${product.name}`
                }
                className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-cream/15"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path d="M5 12h14" strokeLinecap="round" />
                </svg>
              </button>

              <span
                aria-live="polite"
                aria-label={`${qty} ${product.name}`}
                className="min-w-5 text-center text-sm font-semibold tabular-nums"
              >
                {qty}
              </span>

              <button
                type="button"
                onClick={() => addAddOn(product)}
                aria-label={`Add another ${product.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-cream/15"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
