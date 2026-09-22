'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';

/** Sign in, or sign out — reads the session the CartProvider already holds. */
export default function AccountButton({ solid }: { solid: boolean }) {
  const { signedIn } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  const tone = solid
    ? 'text-walnut-400 hover:text-walnut'
    : 'text-cream/75 hover:text-cream';

  if (!signedIn) {
    return (
      <Link
        href={`/account/login?from=${encodeURIComponent(pathname)}`}
        className={`eyebrow hidden transition-colors sm:block ${tone}`}
      >
        Sign in
      </Link>
    );
  }

  async function signOut() {
    setBusy(true);
    await fetch('/api/account/logout', { method: 'POST' });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="hidden items-center gap-3 sm:flex">
      <Link href="/account" className={`eyebrow transition-colors ${tone}`}>
        Account
      </Link>
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        className={`eyebrow transition-colors disabled:opacity-50 ${tone}`}
      >
        {busy ? '…' : 'Sign out'}
      </button>
    </div>
  );
}
