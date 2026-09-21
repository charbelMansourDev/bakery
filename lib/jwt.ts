import { SignJWT, jwtVerify } from 'jose';

/**
 * Pure `jose` sign/verify. No `next/headers`, no mongoose, no bcrypt — this
 * module is imported by middleware and must stay Edge-runtime safe.
 */

export type SessionPayload = { sub: string; username: string };

const SESSION_COOKIE = 'bakery_session';
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error('SESSION_SECRET is not set.');
  return new TextEncoder().encode(value);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

/** Returns the payload, or null for a missing / malformed / expired token. */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sub !== 'string' || typeof payload.username !== 'string') return null;
    return { sub: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, MAX_AGE_SECONDS };
