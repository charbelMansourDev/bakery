import type { ProductDTO } from './product';

/** The cart as it crosses to the client: resolved products, never raw ids. */
export type CartDTO = {
  base: ProductDTO | null;
  addOns: ProductDTO[];
  totalCents: number;
};

export const EMPTY_CART: CartDTO = { base: null, addOns: [], totalCents: 0 };
