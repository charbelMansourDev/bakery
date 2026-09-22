'use client';

import { useCart } from '@/lib/cart-context';
import { formatCents } from '@/lib/money';
import type { ProductDTO } from '@/types/product';
import ProductImage from './ProductImage';

/** Grid card for a savory or sweet add-on. One of each, on or off. */
export default function AddOnCard({ product }: { product: ProductDTO }) {
  const { toggleAddOn, isSelected } = useCart();
  const selected = isSelected(product.id);

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
        <h3 className="font-display text-xl text-walnut">{product.name}</h3>
        <p className="mt-1 font-display text-sm italic text-walnut-400">{product.description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-display text-base text-gold">
            {formatCents(product.price, { signed: true })}
          </p>

          <button
            type="button"
            onClick={() => toggleAddOn(product)}
            aria-pressed={selected}
            aria-label={selected ? `Remove ${product.name}` : `Add ${product.name}`}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
              selected
                ? 'bg-walnut text-cream hover:bg-walnut-700'
                : 'bg-gold text-walnut hover:bg-gold-300'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              {selected ? (
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
