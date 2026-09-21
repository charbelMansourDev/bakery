import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteProductButton from '@/components/admin/DeleteProductButton';
import ProductForm from '@/components/admin/ProductForm';
import { requireAdmin } from '@/lib/auth';
import { getProductById } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/products" className="text-sm text-slate-500 transition hover:text-slate-900">
        ← Back to products
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Edit {product.name}</h1>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <ProductForm product={product} />
      </div>

      <div className="mt-6 rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Delete this product</h2>
        <p className="mt-1 mb-4 text-sm text-slate-500">
          It will disappear from the public menu immediately.
        </p>
        <DeleteProductButton id={product.id} name={product.name} variant="button" />
      </div>
    </div>
  );
}
