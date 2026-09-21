import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/jwt';

/**
 * Optimistic auth check only — it exists so a signed-out admin gets a redirect
 * instead of a flash of the dashboard. The authorization decision that matters
 * is `requireAdmin()` / `requireAdminApi()`, next to the data.
 *
 * Runs on the Edge runtime: `jose` is fine here (Web Crypto), mongoose and
 * bcryptjs are not.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exempt the login page here rather than in the matcher, which only accepts
  // static literals.
  if (pathname === '/admin/login') return NextResponse.next();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Matcher values must be static literals — a computed array is silently ignored.
  // GET /api/products is public, so it is filtered by method inside the handler,
  // not here; only /api/upload and the mutating product routes are matched.
  matcher: ['/admin/:path*', '/api/upload'],
};
