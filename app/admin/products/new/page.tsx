import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/products" className="text-sm text-slate-500 transition hover:text-slate-900">
        ← Back to products
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Add Product</h1>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <ProductForm />
      </div>
    </div>
  );
}
