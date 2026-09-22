import Link from 'next/link';
import Footer from '@/components/site/Footer';
import SectionDivider from '@/components/site/SectionDivider';
import SiteNav from '@/components/site/SiteNav';
import { requireCustomer } from '@/lib/auth';
import { getCart } from '@/lib/cart';
import { formatCents } from '@/lib/money';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Your account · La Belle Fournée' };

export default async function AccountPage() {
  const session = await requireCustomer('/account');
  const cart = await getCart(session.sub);
  const items = cart.base ? [cart.base, ...cart.addOns] : cart.addOns;

  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-2xl px-6 pt-16 pb-24">
        <div className="text-center">
          <h1 className="font-display text-4xl text-walnut">Your account</h1>
          <p className="mt-3 font-display text-base italic text-walnut-400">{session.email}</p>
          <div className="mt-7 mb-9">
            <SectionDivider />
          </div>
        </div>

        <div className="rounded-xl bg-cream-50 p-7 shadow-soft">
          <h2 className="eyebrow text-walnut-400">Your current order</h2>

          {items.length === 0 ? (
            <>
              <p className="mt-4 font-display text-lg italic text-walnut-400">
                Nothing in your basket yet.
              </p>
              <Link
                href="/menu"
                className="mt-6 inline-block rounded-lg bg-gold px-6 py-3 text-sm font-semibold tracking-wide text-walnut transition hover:bg-gold-300"
              >
                Browse the menu
              </Link>
            </>
          ) : (
            <>
              <ul className="mt-4 divide-y divide-cream-200">
                {items.map((item) => (
                  <li key={item.id} className="flex items-baseline justify-between gap-6 py-3">
                    <span className="font-display text-lg text-walnut">{item.name}</span>
                    <span className="font-display text-lg text-gold">
                      {formatCents(item.price, {
                        signed: item.category !== 'base',
                        compact: item.category === 'base',
                      })}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-baseline justify-between border-t border-walnut/15 pt-4">
                <span className="eyebrow text-walnut-400">Total</span>
                <span className="font-display text-xl text-walnut">
                  {formatCents(cart.totalCents)}
                </span>
              </div>

              <Link
                href="/menu"
                className="mt-6 inline-block rounded-lg border border-walnut/30 px-6 py-3 text-sm font-semibold tracking-wide text-walnut transition hover:border-walnut hover:bg-walnut/5"
              >
                Keep building your order
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
