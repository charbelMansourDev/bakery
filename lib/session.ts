import 'server-only';
import { cookies } from 'next/headers';
import {
  cookieNameFor,
  maxAgeFor,
  signSession,
  verifySession,
  type AdminSession,
  type CustomerSession,
  type Role,
} from './jwt';

async function setSessionCookie(payload: AdminSession | CustomerSession): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(cookieNameFor(payload.role), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeFor(payload.role),
  });
}

async function clearSessionCookie(role: Role): Promise<void> {
  const store = await cookies();
  store.delete(cookieNameFor(role));
}

/* ---------- admin ---------- */

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return verifySession(store.get(cookieNameFor('admin'))?.value, 'admin');
}

export const createAdminSession = (payload: Omit<AdminSession, 'role'>) =>
  setSessionCookie({ ...payload, role: 'admin' });

export const clearAdminSession = () => clearSessionCookie('admin');

/* ---------- customer ---------- */

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const store = await cookies();
  return verifySession(store.get(cookieNameFor('customer'))?.value, 'customer');
}

export const createCustomerSession = (payload: Omit<CustomerSession, 'role'>) =>
  setSessionCookie({ ...payload, role: 'customer' });

export const clearCustomerSession = () => clearSessionCookie('customer');

export type { AdminSession, CustomerSession };
