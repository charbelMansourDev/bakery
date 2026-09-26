'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

/**
 * Ends the customer session. Shared by the nav and the cart page.
 *
 * `router.refresh()` re-runs the server layout, which re-reads the (now absent)
 * session and hands the CartProvider an empty cart — so everything that reads
 * `signedIn` or the cart updates without a full page load.
 */
export function useSignOut(afterSignOut?: () => void) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const signOut = useCallback(async () => {
    setBusy(true);
    await fetch('/api/account/logout', { method: 'POST' });
    afterSignOut?.();
    router.refresh();
    setBusy(false);
  }, [router, afterSignOut]);

  return { signOut, busy };
}
