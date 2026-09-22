import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import { getAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Sign in · La Belle Fournée CMS' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  if (await getAdminSession()) redirect('/admin/products');

  const { from } = await searchParams;
  // Only accept an internal path, so ?from= cannot be used as an open redirect.
  const redirectTo = from && from.startsWith('/admin') ? from : '/admin/products';

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="text-xl font-semibold text-slate-900">La Belle Fournée CMS</h1>
      <p className="mt-1 mb-8 text-sm text-slate-500">Sign in to manage the menu.</p>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
