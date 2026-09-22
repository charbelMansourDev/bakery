import { SignJWT, jwtVerify } from 'jose';

/**
 * Pure `jose` sign/verify. No `next/headers`, no mongoose, no bcrypt — this
 * module is imported by middleware and must stay Edge-runtime safe.
 *
 * Admin and customer tokens are signed with the SAME secret, so they must be
 * distinguishable or a customer token would satisfy an admin check. Two
 * independent guards:
 *
 *   1. `aud` is set to the role, and verification passes `audience`, so jose
 *      itself rejects a cross-role token before our code sees the payload.
 *   2. The `role` claim is re-checked against what the caller asked for.
 *
 * They also use separate cookies, so the two sessions coexist in one browser.
 */

export type Role = 'admin' | 'customer';

export type AdminSession = { sub: string; role: 'admin'; username: string };
export type CustomerSession = { sub: string; role: 'customer'; email: string };
export type SessionFor<R extends Role> = R extends 'admin' ? AdminSession : CustomerSession;

export const ADMIN_COOKIE = 'bakery_admin';
export const CUSTOMER_COOKIE = 'bakery_customer';

/** Admins hold elevated rights, so their sessions are deliberately short. */
export const ADMIN_MAX_AGE = 60 * 60 * 8; // 8 hours
export const CUSTOMER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function cookieNameFor(role: Role): string {
  return role === 'admin' ? ADMIN_COOKIE : CUSTOMER_COOKIE;
}

export function maxAgeFor(role: Role): number {
  return role === 'admin' ? ADMIN_MAX_AGE : CUSTOMER_MAX_AGE;
}

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error('SESSION_SECRET is not set.');
  return new TextEncoder().encode(value);
}

export async function signSession(payload: AdminSession | CustomerSession): Promise<string> {
  const claims = payload.role === 'admin' ? { username: payload.username } : { email: payload.email };

  return new SignJWT({ ...claims, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setAudience(payload.role)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeFor(payload.role)}s`)
    .sign(secret());
}

/**
 * Returns the payload, or null for a token that is missing, malformed, expired
 * or issued for a different role.
 */
export async function verifySession<R extends Role>(
  token: string | undefined,
  role: R,
): Promise<SessionFor<R> | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret(), { audience: role });

    if (typeof payload.sub !== 'string') return null;
    if (payload.role !== role) return null;

    if (role === 'admin') {
      if (typeof payload.username !== 'string') return null;
      return { sub: payload.sub, role: 'admin', username: payload.username } as SessionFor<R>;
    }

    if (typeof payload.email !== 'string') return null;
    return { sub: payload.sub, role: 'customer', email: payload.email } as SessionFor<R>;
  } catch {
    return null;
  }
}
