import type { ProductDTO } from './product';

/**
 * One item in an order: a loaf, optionally with a topping folded through it.
 *
 * `key` identifies the line — the topping's id, or the loaf's id for a plain
 * loaf. Product ids are unique across the whole menu, so a single "keys are
 * unique" rule enforces both "each topping once" and "each plain loaf once".
 */
export type CartLineDTO = {
  key: string;
  base: ProductDTO;
  /** null for a plain loaf. */
  addOn: ProductDTO | null;
  /** loaf + topping, integer cents */
  totalCents: number;
};

/** The cart as it crosses to the client: resolved products, never raw ids. */
export type CartDTO = {
  lines: CartLineDTO[];
  totalCents: number;
};

export const EMPTY_CART: CartDTO = { lines: [], totalCents: 0 };

/** The key a line is identified by. Shared by server and client so they agree. */
export function lineKey(baseId: string, addOnId: string | null): string {
  return addOnId ?? baseId;
}

/** Builds a line. Shared so the optimistic client and the server price it identically. */
export function makeLine(base: ProductDTO, addOn: ProductDTO | null): CartLineDTO {
  return {
    key: lineKey(base.id, addOn?.id ?? null),
    base,
    addOn,
    totalCents: base.price + (addOn?.price ?? 0),
  };
}

export function totalOf(lines: CartLineDTO[]): number {
  return lines.reduce((sum, line) => sum + line.totalCents, 0);
}
