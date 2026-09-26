'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatCents } from '@/lib/money';
import { useSignOut } from '@/lib/use-sign-out';
import { buildOrderMessage, whatsappUrl } from '@/lib/whatsapp';

/**
 * The full order, read from the live cart context so a removal shows at once
 * rather than after a server round trip. "Review Order" hands it to WhatsApp —
 * there is no checkout.
 */
export default function CartView({ email }: { email: string }) {
  const { lines, isEmpty, totalCents, removeLine, error } = useCart();
  const { signOut, busy } = useSignOut();

  return (
    <>
      <div className="rounded-xl bg-cream-50 p-7 shadow-soft">
        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        {isEmpty ? (
          <>
            <p className="font-display text-lg italic text-walnut-400">Nothing in your order yet.</p>
            <Link
              href="/menu"
              className="mt-6 inline-block rounded-lg bg-gold px-6 py-3 text-sm font-semibold tracking-wide text-walnut transition hover:bg-gold-300"
            >
              Browse the menu
            </Link>
          </>
        ) : (
          <>
            <ul className="divide-y divide-cream-200">
              {lines.map((line) => (
                <li key={line.key} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="font-display text-lg text-walnut">
                      {line.addOn ? `${line.addOn.name} on ${line.base.name}` : `${line.base.name}, plain`}
                    </p>
                    <p className="text-xs text-walnut-400">
                      {line.addOn
                        ? `${line.addOn.name} ${formatCents(line.addOn.price)} + ${line.base.name} ${formatCents(line.base.price, { compact: true })}`
                        : `${line.base.name} ${formatCents(line.base.price, { compact: true })}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-display text-lg text-gold">{formatCents(line.totalCents)}</span>
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      aria-label={`Remove ${line.addOn ? `${line.addOn.name} on ${line.base.name}` : `plain ${line.base.name}`}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-walnut-400 transition hover:bg-walnut/5 hover:text-walnut"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex items-baseline justify-between border-t border-walnut/15 pt-4">
              <span className="eyebrow text-walnut-400">Total</span>
              <span className="font-display text-2xl text-walnut">{formatCents(totalCents)}</span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl(buildOrderMessage(lines, totalCents))}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gold px-6 py-3 text-center text-sm font-semibold tracking-wide text-walnut transition hover:bg-gold-300"
              >
                Review Order
              </a>
              <Link
                href="/menu"
                className="rounded-lg border border-walnut/30 px-6 py-3 text-center text-sm font-semibold tracking-wide text-walnut transition hover:border-walnut hover:bg-walnut/5"
              >
                Keep browsing
              </Link>
            </div>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-walnut-400">
        Signed in as {email} ·{' '}
        <button
          type="button"
          onClick={signOut}
          disabled={busy}
          className="underline underline-offset-4 transition hover:text-walnut disabled:opacity-50"
        >
          {busy ? 'Signing out…' : 'Sign out'}
        </button>
      </p>
    </>
  );
}
