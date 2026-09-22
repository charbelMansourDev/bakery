'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ProductDTO } from '@/types/product';

/**
 * Client-only "build your loaf" state. Deliberately not persisted: there is no
 * order storage, no checkout and no payment in this project.
 *
 * An order is exactly ONE base loaf plus any number of distinct add-ons, each
 * taken once — add-ons are a flavour folded through the dough, not a countable
 * item, so they toggle rather than carrying a quantity.
 */

type CartState = {
  base: ProductDTO | null;
  addOns: ProductDTO[];
  /** Selecting a different base replaces the current one; selecting it again clears it. */
  selectBase: (product: ProductDTO) => void;
  /** Add-ons toggle on and off. */
  toggleAddOn: (product: ProductDTO) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  items: ProductDTO[];
  isEmpty: boolean;
  totalCents: number;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [base, setBase] = useState<ProductDTO | null>(null);
  const [addOns, setAddOns] = useState<ProductDTO[]>([]);

  const selectBase = useCallback((product: ProductDTO) => {
    setBase((current) => (current?.id === product.id ? null : product));
  }, []);

  const toggleAddOn = useCallback((product: ProductDTO) => {
    setAddOns((current) =>
      current.some((item) => item.id === product.id)
        ? current.filter((item) => item.id !== product.id)
        : [...current, product],
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setBase((current) => (current?.id === id ? null : current));
    setAddOns((current) => current.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => {
    setBase(null);
    setAddOns([]);
  }, []);

  const value = useMemo<CartState>(() => {
    const items = base ? [base, ...addOns] : addOns;
    return {
      base,
      addOns,
      selectBase,
      toggleAddOn,
      removeItem,
      clear,
      isSelected: (id: string) => base?.id === id || addOns.some((item) => item.id === id),
      items,
      isEmpty: items.length === 0,
      totalCents: items.reduce((sum, item) => sum + item.price, 0),
    };
  }, [base, addOns, selectBase, toggleAddOn, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside a CartProvider');
  return context;
}
