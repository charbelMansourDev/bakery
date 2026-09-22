import 'server-only';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { getAdminSession, getCustomerSession, type AdminSession, type CustomerSession } from './session';

/**
 * The real authorization gate. Middleware only handles redirect UX — it is not
 * an authorization boundary (cf. CVE-2025-29927, and Next's own guidance that
 * middleware is for "optimistic checks"). Every protected page and every
 * mutating route handler calls into this module first.
 */

type ApiGuard<T> = { ok: true; session: T } | { ok: false; response: NextResponse };

function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/* ---------- admin ---------- */

/** For Server Components: redirects to the admin login when signed out. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}

/** For Route Handlers: returns a 401 response instead of redirecting. */
export async function requireAdminApi(): Promise<ApiGuard<AdminSession>> {
  const session = await getAdminSession();
  return session ? { ok: true, session } : { ok: false, response: unauthorized() };
}

/* ---------- customer ---------- */

export async function requireCustomer(returnTo?: string): Promise<CustomerSession> {
  const session = await getCustomerSession();
  if (!session) {
    redirect(returnTo ? `/account/login?from=${encodeURIComponent(returnTo)}` : '/account/login');
  }
  return session;
}

export async function requireCustomerApi(): Promise<ApiGuard<CustomerSession>> {
  const session = await getCustomerSession();
  return session ? { ok: true, session } : { ok: false, response: unauthorized() };
}
