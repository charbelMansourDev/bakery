'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ProductDTO } from '@/types/product';
import type { CartDTO } from '@/types/cart';

/**
 * The cart lives on the server, one per customer, so it survives a reload and
 * follows the customer between devices. This provider is a thin optimistic
 * layer over it: local state updates immediately, the write goes out behind it,
 * and a failed write rolls the local state back.
 *
 * Ordering requires an account, so a tap while signed out sends the customer to
 * sign in rather than quietly dropping the item.
 */

type CartState = {
  signedIn: boolean;
  base: ProductDTO | null;
  addOns: ProductDTO[];
  items: ProductDTO[];
  isEmpty: boolean;
  totalCents: number;
  isSelected: (id: string) => boolean;
  selectBase: (product: ProductDTO) => void;
  toggleAddOn: (product: ProductDTO) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  pending: boolean;
  error: string | null;
};

const CartContext = createContext<CartState | null>(null);

function totalOf(base: ProductDTO | null, addOns: ProductDTO[]): number {
  return (base?.price ?? 0) + addOns.reduce((sum, item) => sum + item.price, 0);
}

export function CartProvider({
  children,
  signedIn,
  initialCart,
}: {
  children: React.ReactNode;
  signedIn: boolean;
  initialCart: CartDTO;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [base, setBase] = useState<ProductDTO | null>(initialCart.base);
  const [addOns, setAddOns] = useState<ProductDTO[]>(initialCart.addOns);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Writes are chained rather than fired in parallel: two rapid taps would
   * otherwise race, and whichever response landed last would win regardless of
   * which tap came last.
   */
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const persist = useCallback(
    (nextBase: ProductDTO | null, nextAddOns: ProductDTO[], rollback: () => void) => {
      setPending(true);
      setError(null);

      queue.current = queue.current
        .then(async () => {
          const response = await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              baseId: nextBase?.id ?? null,
              addOnIds: nextAddOns.map((item) => item.id),
            }),
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            rollback();
            setError(data.error ?? 'Could not update your cart.');
            // The session can expire mid-visit; send them back to sign in.
            if (response.status === 401) router.push('/account/login');
          }
        })
        .catch(() => {
          rollback();
          setError('Could not reach the server. Check your connection.');
        })
        .finally(() => setPending(false));
    },
    [router],
  );

  /** Returns false when the customer must sign in first. */
  const ensureSignedIn = useCallback(() => {
    if (signedIn) return true;
    router.push(`/account/login?from=${encodeURIComponent(pathname)}`);
    return false;
  }, [signedIn, router, pathname]);

  const selectBase = useCallback(
    (product: ProductDTO) => {
      if (!ensureSignedIn()) return;
      const previous = base;
      const next = previous?.id === product.id ? null : product;
      setBase(next);
      persist(next, addOns, () => setBase(previous));
    },
    [base, addOns, ensureSignedIn, persist],
  );

  const toggleAddOn = useCallback(
    (product: ProductDTO) => {
      if (!ensureSignedIn()) return;
      const previous = addOns;
      const next = previous.some((item) => item.id === product.id)
        ? previous.filter((item) => item.id !== product.id)
        : [...previous, product];
      setAddOns(next);
      persist(base, next, () => setAddOns(previous));
    },
    [base, addOns, ensureSignedIn, persist],
  );

  const removeItem = useCallback(
    (id: string) => {
      if (!ensureSignedIn()) return;
      const previousBase = base;
      const previousAddOns = addOns;
      const nextBase = previousBase?.id === id ? null : previousBase;
      const nextAddOns = previousAddOns.filter((item) => item.id !== id);
      setBase(nextBase);
      setAddOns(nextAddOns);
      persist(nextBase, nextAddOns, () => {
        setBase(previousBase);
        setAddOns(previousAddOns);
      });
    },
    [base, addOns, ensureSignedIn, persist],
  );

  const clear = useCallback(() => {
    if (!ensureSignedIn()) return;
    const previousBase = base;
    const previousAddOns = addOns;
    setBase(null);
    setAddOns([]);
    persist(null, [], () => {
      setBase(previousBase);
      setAddOns(previousAddOns);
    });
  }, [base, addOns, ensureSignedIn, persist]);

  const value = useMemo<CartState>(() => {
    const items = base ? [base, ...addOns] : addOns;
    return {
      signedIn,
      base,
      addOns,
      items,
      isEmpty: items.length === 0,
      totalCents: totalOf(base, addOns),
      isSelected: (id: string) => base?.id === id || addOns.some((item) => item.id === id),
      selectBase,
      toggleAddOn,
      removeItem,
      clear,
      pending,
      error,
    };
  }, [signedIn, base, addOns, selectBase, toggleAddOn, removeItem, clear, pending, error]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside a CartProvider');
  return context;
}
