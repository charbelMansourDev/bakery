'use client';

import { useId } from 'react';
import { useCart } from '@/lib/cart-context';
import { formatCents } from '@/lib/money';
import type { ProductDTO } from '@/types/product';
import ProductImage from './ProductImage';

/**
 * Grid card for a savory or sweet topping. Every item carries its own loaf, so
 * the customer picks it here: tapping a loaf chip adds the topping on that loaf,
 * tapping the other chip moves it, and ✕ takes it out. A topping can only be
 * ordered once — on one loaf — which the chips express directly.
 */
export default function AddOnCard({
  product,
  bases,
}: {
  product: ProductDTO;
  /** The loaves on the menu — the choices this topping can go on. */
  bases: ProductDTO[];
}) {
  const { lineForAddOn, setToppingLoaf, removeLine } = useCart();
  const line = lineForAddOn(product.id);
  const labelId = useId();

  return (
    <article className="group overflow-hidden rounded-xl bg-cream-50 shadow-soft transition hover:shadow-soft-lg">
      <div className="relative aspect-4/3 overflow-hidden">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
        />
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl text-walnut">{product.name}</h3>
          <p className="shrink-0 font-display text-base text-gold">
            {formatCents(product.price, { signed: true })}
          </p>
        </div>
        <p className="mt-1 font-display text-sm italic text-walnut-400">{product.description}</p>

        <p id={labelId} className="eyebrow mt-5 text-walnut-400">
          On which loaf?
        </p>

        {bases.length === 0 ? (
          <p className="mt-2 text-xs text-walnut-400">No loaves on the menu right now.</p>
        ) : (
          <div role="group" aria-labelledby={labelId} className="mt-2 flex flex-wrap gap-2">
            {bases.map((base) => {
              const active = line?.base.id === base.id;
              return (
                <button
                  key={base.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setToppingLoaf(product, base)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition ${
                    active
                      ? 'border-walnut bg-walnut text-cream'
                      : 'border-walnut/25 text-walnut hover:border-walnut hover:bg-walnut/5'
                  }`}
                >
                  {base.name}{' '}
                  <span className={active ? 'text-gold-300' : 'text-walnut-400'}>
                    {formatCents(base.price, { compact: true })}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex min-h-9 items-center justify-between gap-3 border-t border-cream-200 pt-3">
          {line ? (
            <>
              <p className="text-sm text-walnut">
                In your order ·{' '}
                <span className="font-display text-base text-gold">
                  {formatCents(line.totalCents)}
                </span>
              </p>
              <button
                type="button"
                onClick={() => removeLine(line.key)}
                aria-label={`Remove ${product.name} from your order`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-walnut-400 transition hover:bg-walnut/5 hover:text-walnut"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </>
          ) : (
            <p className="text-xs text-walnut-400">Tap a loaf to add it to your order.</p>
          )}
        </div>
      </div>
    </article>
  );
}
