import mongoose, { type Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.');
}

// Cached across hot reloads (dev) and warm lambdas (prod) so we never open a
// second connection pool. Typed via the `declare global` in types/global.d.ts.
const cached = global._mongoose ?? (global._mongoose = { conn: null, promise: null });

export default async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      // Fail fast instead of silently queueing a query against a dead
      // connection. Makes `await dbConnect()` mandatory in every data function.
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Clear the rejected promise so the next request retries rather than
    // replaying the same failure forever.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
