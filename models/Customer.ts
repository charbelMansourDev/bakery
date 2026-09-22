import mongoose, { Schema, type Model, type InferSchemaType } from 'mongoose';

/**
 * A customer is identified by email alone — there is no password, because
 * sign-in is a one-time code sent to that address. The first successful
 * verification for an unseen address creates the account.
 */
const customerSchema = new Schema(
  {
    // Stored lowercased and trimmed so "Ada@X.com" and "ada@x.com" are one person.
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, trim: true, default: '' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export type CustomerDoc = InferSchemaType<typeof customerSchema>;

const Customer =
  (mongoose.models.Customer as Model<CustomerDoc>) ||
  mongoose.model<CustomerDoc>('Customer', customerSchema);

export default Customer;
