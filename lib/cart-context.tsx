'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ProductDTO } from '@/types/product';

/**
 * Client-only "build your loaf" state. Deliberately not persisted: there is no
 * order storage, no checkout and no payment in this project.
 *
 * An order is exactly ONE base loaf plus any number of add-ons, and an add-on
 * carries a quantity — two olive, three chocolate — so it is stored as a line
 * rather than as bare membership in a list.
 */

/** An add-on together with how many were ordered. */
export type CartLine = { product: ProductDTO; qty: number };

type CartState = {
  base: ProductDTO | null;
  addOns: CartLine[];
  /** Selecting a different base replaces the current one; selecting it again clears it. */
  selectBase: (product: ProductDTO) => void;
  /** First call adds the line, each later call bumps its quantity. */
  addAddOn: (product: ProductDTO) => void;
  /** Steps a line down, dropping it entirely when the last one goes. */
  removeOneAddOn: (product: ProductDTO) => void;
  /** Drops a line outright, whatever its quantity. */
  removeItem: (id: string) => void;
  clear: () => void;
  /** How many of this product are in the order (the base counts as one). */
  qtyOf: (id: string) => number;
  isSelected: (id: string) => boolean;
  isEmpty: boolean;
  totalCents: number;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [base, setBase] = useState<ProductDTO | null>(null);
  const [addOns, setAddOns] = useState<CartLine[]>([]);

  const selectBase = useCallback((product: ProductDTO) => {
    setBase((current) => (current?.id === product.id ? null : product));
  }, []);

  const addAddOn = useCallback((product: ProductDTO) => {
    setAddOns((current) =>
      current.some((line) => line.product.id === product.id)
        ? current.map((line) =>
            line.product.id === product.id ? { ...line, qty: line.qty + 1 } : line,
          )
        : [...current, { product, qty: 1 }],
    );
  }, []);

  const removeOneAddOn = useCallback((product: ProductDTO) => {
    setAddOns((current) =>
      // flatMap so the last decrement drops the line instead of leaving qty 0.
      current.flatMap((line) => {
        if (line.product.id !== product.id) return [line];
        return line.qty > 1 ? [{ ...line, qty: line.qty - 1 }] : [];
      }),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setBase((current) => (current?.id === id ? null : current));
    setAddOns((current) => current.filter((line) => line.product.id !== id));
  }, []);

  const clear = useCallback(() => {
    setBase(null);
    setAddOns([]);
  }, []);

  const value = useMemo<CartState>(() => {
    const qtyOf = (id: string) =>
      base?.id === id ? 1 : (addOns.find((line) => line.product.id === id)?.qty ?? 0);

    return {
      base,
      addOns,
      selectBase,
      addAddOn,
      removeOneAddOn,
      removeItem,
      clear,
      qtyOf,
      isSelected: (id: string) => qtyOf(id) > 0,
      isEmpty: !base && addOns.length === 0,
      totalCents:
        (base?.price ?? 0) +
        addOns.reduce((sum, line) => sum + line.product.price * line.qty, 0),
    };
  }, [base, addOns, selectBase, addAddOn, removeOneAddOn, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside a CartProvider');
  return context;
}
