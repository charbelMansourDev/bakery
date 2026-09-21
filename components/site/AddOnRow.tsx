import { formatCents } from '@/lib/money';
import type { ProductDTO } from '@/types/product';

/**
 * Menu row used in the landing page preview. The rows are separated by the
 * parent list's `divide-y` rules; there is deliberately no dotted leader, which
 * sat on the same baseline and collided with those rules.
 */
export default function AddOnRow({ product }: { product: ProductDTO }) {
  return (
    <li className="flex items-baseline justify-between gap-6 py-3.5">
      <div className="min-w-0">
        <p className="font-display text-lg text-walnut">{product.name}</p>
        <p className="font-display text-sm italic text-walnut-400">{product.description}</p>
      </div>
      <p className="shrink-0 font-display text-lg text-gold">
        {formatCents(product.price, { signed: true })}
      </p>
    </li>
  );
}
