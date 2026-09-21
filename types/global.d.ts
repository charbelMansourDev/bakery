import type { Mongoose } from 'mongoose';

declare global {
  // Must be `var` for the global augmentation to apply. Caches the mongoose
  // connection across hot reloads and serverless invocations.
  var _mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null } | undefined;
}

export {};
