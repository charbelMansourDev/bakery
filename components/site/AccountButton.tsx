'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';

/**
 * Sign in, or sign out — reads the session the CartProvider already holds.
 *
 * Two shapes. `inline` sits in the nav bar and is hidden on small screens,
 * where there is no room beside the logo and the Pre-Order button; `menu`
 * renders as rows inside the mobile dropdown so the controls are still
 * reachable there.
 */
export default function AccountButton({
  solid = true,
  variant = 'inline',
  onNavigate,
}: {
  solid?: boolean;
  variant?: 'inline' | 'menu';
  onNavigate?: () => void;
}) {
  const { signedIn } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  const loginHref = `/account/login?from=${encodeURIComponent(pathname)}`;

  async function signOut() {
    setBusy(true);
    await fetch('/api/account/logout', { method: 'POST' });
    onNavigate?.();
    router.refresh();
    setBusy(false);
  }

  if (variant === 'menu') {
    const row =
      'eyebrow block w-full border-b border-cream-200 py-4 text-left text-walnut-400 transition-colors hover:text-walnut';

    if (!signedIn) {
      return (
        <li>
          <Link href={loginHref} onClick={onNavigate} className={row}>
            Sign in
          </Link>
        </li>
      );
    }

    return (
      <>
        <li>
          <Link href="/account" onClick={onNavigate} className={row}>
            Account
          </Link>
        </li>
        <li>
          <button type="button" onClick={signOut} disabled={busy} className={`${row} disabled:opacity-50`}>
            {busy ? 'Signing out…' : 'Sign out'}
          </button>
        </li>
      </>
    );
  }

  const tone = solid ? 'text-walnut-400 hover:text-walnut' : 'text-cream/75 hover:text-cream';

  if (!signedIn) {
    return (
      <Link href={loginHref} className={`eyebrow hidden transition-colors sm:block ${tone}`}>
        Sign in
      </Link>
    );
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
