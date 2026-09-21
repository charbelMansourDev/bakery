/**
 * Seeds the 8 menu products and the single admin user.
 *
 * Run with `npm run seed`. Safe to re-run: products are upserted on `name`, so
 * re-seeding never wipes prices or images edited through the CMS. It does reset
 * the admin password to whatever ADMIN_PASSWORD currently holds.
 *
 * `tsx` does not read .env.local — that is a Next.js feature, not a Node one —
 * so we load it explicitly or MONGODB_URI would be undefined and the connection
 * would fall back to localhost with a confusing ECONNREFUSED.
 */
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.join(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import { hash } from 'bcryptjs';
import Product from '../models/Product';
import Admin from '../models/Admin';
import type { Category } from '../types/product';

type SeedProduct = {
  name: string;
  category: Category;
  description: string;
  /** integer cents */
  price: number;
  imageUrl: string;
  sortOrder: number;
};

const PRODUCTS: SeedProduct[] = [
  { name: 'Classic',            category: 'base',   description: 'Naturally fermented • Hand shaped • Slow rested', price: 400, imageUrl: '/images/classic.jpg',            sortOrder: 1 },
  { name: 'Whole Wheat',        category: 'base',   description: 'Naturally fermented • Hand shaped • Slow rested', price: 500, imageUrl: '/images/whole-wheat.jpg',        sortOrder: 2 },
  { name: "Za'atar",            category: 'savory', description: 'Thyme, sesame & sumac',                           price: 150, imageUrl: '/images/zaatar.jpg',             sortOrder: 3 },
  { name: 'Olive',              category: 'savory', description: 'Green & kalamata olives',                         price: 250, imageUrl: '/images/olive.jpg',              sortOrder: 4 },
  { name: 'Multigrain',         category: 'savory', description: 'Sunflower, flax & sesame',                        price: 200, imageUrl: '/images/multigrain.jpg',         sortOrder: 5 },
  { name: 'Chocolate',          category: 'sweet',  description: 'Dark chocolate ribbons',                          price: 300, imageUrl: '/images/chocolate.jpg',          sortOrder: 6 },
  { name: 'Cinnamon',           category: 'sweet',  description: 'Brown sugar & cinnamon',                          price: 250, imageUrl: '/images/cinnamon.jpg',           sortOrder: 7 },
  { name: 'La Belle Signature', category: 'sweet',  description: 'Fig, Walnut & Raisin',                            price: 350, imageUrl: '/images/la-belle-signature.jpg', sortOrder: 8 },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  const missing = [
    !uri && 'MONGODB_URI',
    !username && 'ADMIN_USERNAME',
    !password && 'ADMIN_PASSWORD',
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Missing env ${missing.join(', ')}. Copy .env.example to .env.local.`);
  }

  console.log('Connecting to MongoDB…');
  await mongoose.connect(uri!, { bufferCommands: false });

  const result = await Product.bulkWrite(
    PRODUCTS.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $set: product },
        upsert: true,
      },
    })),
  );
  console.log(
    `Products: ${result.upsertedCount} inserted, ${result.modifiedCount} updated, ` +
      `${PRODUCTS.length - result.upsertedCount - result.modifiedCount} already current.`,
  );

  const passwordHash = await hash(password!, 10);
  await Admin.updateOne(
    { username },
    { $set: { username, passwordHash } },
    { upsert: true },
  );
  console.log(`Admin "${username}" is ready. Sign in at /admin/login.`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(async (err) => {
  console.error('\nSeed failed:', err instanceof Error ? err.message : err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
