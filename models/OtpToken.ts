import mongoose, { Schema, type Model, type InferSchemaType } from 'mongoose';

/**
 * A pending one-time sign-in code.
 *
 * The code is stored as a bcrypt hash, never in plaintext: a leaked database
 * snapshot should not hand over live login codes. `attempts` caps brute force
 * against a 6-digit space, and the TTL index makes Mongo delete expired rows on
 * its own so nothing has to sweep them.
 */
const otpTokenSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, required: true, default: 0 },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// expireAfterSeconds: 0 means "delete once expiresAt is in the past".
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OtpTokenDoc = InferSchemaType<typeof otpTokenSchema>;

const OtpToken =
  (mongoose.models.OtpToken as Model<OtpTokenDoc>) ||
  mongoose.model<OtpTokenDoc>('OtpToken', otpTokenSchema);

export default OtpToken;
