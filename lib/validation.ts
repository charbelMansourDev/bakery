import { z } from 'zod';
import { CATEGORIES, type Category } from '@/types/product';

const categoryEnum = z.enum(CATEGORIES as unknown as [Category, ...Category[]]);

/** Prices arrive as integer CENTS. The admin form converts dollars -> cents before sending. */
export const productCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  category: categoryEnum,
  description: z.string().trim().max(300).default(''),
  price: z.number().int('Price must be whole cents').min(0).max(1_000_000),
  imageUrl: z.string().trim().max(500).default(''),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});

export const productUpdateSchema = productCreateSchema.partial();

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(120),
  password: z.string().min(1, 'Password is required').max(200),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
