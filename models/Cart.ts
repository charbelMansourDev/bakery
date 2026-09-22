import mongoose, { Schema, type Model, type InferSchemaType } from 'mongoose';

/**
 * One cart per customer, stored server-side.
 *
 * Product references rather than copies: a cart should reflect the menu as it
 * is now, so a price edited in the CMS is the price the customer sees. Items
 * that have since been deleted are dropped when the cart is read.
 *
 * Mirrors the shape the UI has always used — one base loaf, any number of
 * distinct add-ons, each taken once.
 */
const cartSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, unique: true },
    base: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    addOns: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: [] },
  },
  { timestamps: true },
);

export type CartDoc = InferSchemaType<typeof cartSchema>;

const Cart =
  (mongoose.models.Cart as Model<CartDoc>) || mongoose.model<CartDoc>('Cart', cartSchema);

export default Cart;
