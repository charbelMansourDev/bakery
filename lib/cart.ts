import 'server-only';
import { isValidObjectId, type Types } from 'mongoose';
import dbConnect from './db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import type { Category, ProductDTO } from '@/types/product';
import { EMPTY_CART, type CartDTO } from '@/types/cart';

/**
 * Server-side cart, one per customer.
 *
 * Stores product ids and resolves them on read, so a price edited in the CMS is
 * immediately the price the customer sees, and a product deleted from the menu
 * silently drops out of any cart holding it rather than lingering as a ghost
 * line at a stale price.
 */

type LeanProduct = {
  _id: Types.ObjectId;
  name: string;
  category: Category;
  description: string;
  price: number;
  imageUrl: string;
  sortOrder: number;
};

function toProductDTO(doc: LeanProduct): ProductDTO {
  return {
    id: doc._id.toString(),
    name: doc.name,
    category: doc.category,
    description: doc.description ?? '',
    price: doc.price,
    imageUrl: doc.imageUrl ?? '',
    sortOrder: doc.sortOrder ?? 0,
  };
}

function buildCart(base: ProductDTO | null, addOns: ProductDTO[]): CartDTO {
  const items = base ? [base, ...addOns] : addOns;
  return { base, addOns, totalCents: items.reduce((sum, item) => sum + item.price, 0) };
}

export async function getCart(customerId: string): Promise<CartDTO> {
  if (!isValidObjectId(customerId)) return EMPTY_CART;
  await dbConnect();

  const cart = await Cart.findOne({ customerId }).lean<{
    base?: Types.ObjectId | null;
    addOns?: Types.ObjectId[];
  } | null>();
  if (!cart) return EMPTY_CART;

  const ids = [...(cart.base ? [cart.base] : []), ...(cart.addOns ?? [])];
  if (ids.length === 0) return EMPTY_CART;

  const products = await Product.find({ _id: { $in: ids } }).lean<LeanProduct[]>();
  const byId = new Map(products.map((p) => [p._id.toString(), toProductDTO(p)]));

  const base = cart.base ? (byId.get(cart.base.toString()) ?? null) : null;
  // Preserve the customer's ordering, skipping anything no longer on the menu.
  const addOns = (cart.addOns ?? [])
    .map((id) => byId.get(id.toString()))
    .filter((p): p is ProductDTO => Boolean(p));

  return buildCart(base, addOns);
}

export class CartError extends Error {}

/**
 * Replaces the whole cart in one write. The client sends the state it wants
 * rather than a diff, so two rapid taps cannot interleave into a cart neither
 * of them asked for.
 */
export async function replaceCart(
  customerId: string,
  input: { baseId: string | null; addOnIds: string[] },
): Promise<CartDTO> {
  await dbConnect();

  const requested = [...(input.baseId ? [input.baseId] : []), ...input.addOnIds];
  if (requested.some((id) => !isValidObjectId(id))) {
    throw new CartError('That item is not on the menu.');
  }

  const products = await Product.find({ _id: { $in: requested } }).lean<LeanProduct[]>();
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  if (requested.some((id) => !byId.has(id))) {
    throw new CartError('That item is no longer on the menu.');
  }

  // Enforce the shape of an order server-side; the UI enforces it too, but the
  // UI is not where the rule lives.
  if (input.baseId && byId.get(input.baseId)!.category !== 'base') {
    throw new CartError('That product cannot be used as the base loaf.');
  }
  if (input.addOnIds.some((id) => byId.get(id)!.category === 'base')) {
    throw new CartError('A base loaf cannot be added as an add-on.');
  }

  const addOnIds = [...new Set(input.addOnIds)];

  await Cart.findOneAndUpdate(
    { customerId },
    { $set: { base: input.baseId ?? null, addOns: addOnIds } },
    { upsert: true, new: true, runValidators: true },
  );

  const base = input.baseId ? toProductDTO(byId.get(input.baseId)!) : null;
  return buildCart(
    base,
    addOnIds.map((id) => toProductDTO(byId.get(id)!)),
  );
}

export async function clearCart(customerId: string): Promise<CartDTO> {
  await dbConnect();
  await Cart.findOneAndUpdate(
    { customerId },
    { $set: { base: null, addOns: [] } },
    { upsert: true },
  );
  return EMPTY_CART;
}
