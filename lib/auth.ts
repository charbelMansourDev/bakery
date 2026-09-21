import 'server-only';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { getSession, type SessionPayload } from './session';

/**
 * The real authorization gate. Middleware only handles redirect UX — it is not
 * an authorization boundary (cf. CVE-2025-29927, and Next's own guidance that
 * middleware is for "optimistic checks"). Every protected page and every
 * mutating route handler calls into this module first.
 */

/** For Server Components: redirects to the login page when signed out. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}

/** For Route Handlers: returns a 401 response instead of redirecting. */
export async function requireAdminApi(): Promise<
  { ok: true; session: SessionPayload } | { ok: false; response: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { ok: true, session };
}
