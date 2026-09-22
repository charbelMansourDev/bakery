import { formatCents } from '@/lib/money';
import type { ProductDTO } from '@/types/product';

/**
 * Menu row used in the landing page preview.
 *
 * Items are separated by surface and space rather than by rules: each sits on
 * its own slightly lighter card, which echoes the product cards elsewhere on
 * the page and keeps the column quiet — six horizontal lines in a short list
 * read as clutter, and the earlier dotted leaders collided with them.
 */
export default function AddOnRow({ product }: { product: ProductDTO }) {
  return (
    <li className="rounded-lg bg-cream-50 px-5 py-4 transition-shadow duration-300 hover:shadow-soft">
      <div className="flex items-baseline justify-between gap-5">
        <p className="min-w-0 font-display text-lg text-walnut">{product.name}</p>
        <p className="shrink-0 font-display text-lg text-gold">
          {formatCents(product.price, { signed: true })}
        </p>
      </div>
      <p className="mt-1 font-display text-sm italic text-walnut-400">{product.description}</p>
    </li>
  );
}
