import { redirect } from 'next/navigation';
import AccountLoginForm from '@/components/site/AccountLoginForm';
import Footer from '@/components/site/Footer';
import SectionDivider from '@/components/site/SectionDivider';
import SiteNav from '@/components/site/SiteNav';
import { getCustomerSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Sign in · La Belle Fournée' };

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  // Only accept a relative path, so ?from= cannot be used as an open redirect.
  const redirectTo = from && from.startsWith('/') && !from.startsWith('//') ? from : '/menu';

  if (await getCustomerSession()) redirect(redirectTo);

  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-md px-6 pt-16 pb-24">
        <div className="text-center">
          <h1 className="font-display text-4xl text-walnut">Sign in</h1>
          <p className="mt-3 font-display text-base italic text-walnut-400">
            To place a pre-order, we just need your email.
          </p>
          <div className="mt-7 mb-9">
            <SectionDivider />
          </div>
        </div>

        <AccountLoginForm redirectTo={redirectTo} />
      </main>
      <Footer />
    </>
  );
}
