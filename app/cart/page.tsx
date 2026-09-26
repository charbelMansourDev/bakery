import CartView from '@/components/site/CartView';
import Footer from '@/components/site/Footer';
import SectionDivider from '@/components/site/SectionDivider';
import SiteNav from '@/components/site/SiteNav';
import { requireCustomer } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Your order · La Belle Fournée' };

export default async function CartPage() {
  const session = await requireCustomer('/cart');

  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-2xl px-6 pt-16 pb-24">
        <div className="text-center">
          <h1 className="font-display text-4xl text-walnut">Your order</h1>
          <p className="mt-3 font-display text-base italic text-walnut-400">
            Each loaf baked to order.
          </p>
          <div className="mt-7 mb-9">
            <SectionDivider />
          </div>
        </div>

        <CartView email={session.email} />
      </main>
      <Footer />
    </>
  );
}
