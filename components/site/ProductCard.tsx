'use client';

import { useCart } from '@/lib/cart-context';
import { formatCents } from '@/lib/money';
import type { ProductDTO } from '@/types/product';
import ProductImage from './ProductImage';

/** Feature card for a base loaf. Selecting one replaces whatever base was chosen. */
export default function ProductCard({
  product,
  priority = false,
}: {
  product: ProductDTO;
  priority?: boolean;
}) {
  const { selectBase, isSelected } = useCart();
  const selected = isSelected(product.id);

  return (
    <article className="group overflow-hidden rounded-xl bg-cream-50 shadow-soft transition hover:shadow-soft-lg">
      <div className="relative aspect-[16/10] overflow-hidden">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          priority={priority}
          sizes="(min-width: 1024px) 45vw, 100vw"
        />
      </div>

      <div className="p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-2xl text-walnut">{product.name}</h3>
          <p className="font-display text-xl text-gold">{formatCents(product.price, { compact: true })}</p>
        </div>

        <p className="mt-2 font-display text-sm italic text-walnut-400">{product.description}</p>

        <button
          type="button"
          onClick={() => selectBase(product)}
          aria-pressed={selected}
          className={`mt-5 w-full rounded-lg border px-4 py-3 text-sm font-semibold tracking-wide transition ${
            selected
              ? 'border-walnut bg-walnut text-cream hover:bg-walnut-700'
              : 'border-walnut/30 text-walnut hover:border-walnut hover:bg-walnut/5'
          }`}
        >
          {selected ? 'Added to Order' : 'Add to Order'}
        </button>
      </div>
    </article>
  );
}
