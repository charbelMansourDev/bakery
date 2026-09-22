import 'server-only';
import { randomInt } from 'node:crypto';
import { compare, hash } from 'bcryptjs';
import dbConnect from './db';
import Customer from '@/models/Customer';
import OtpToken from '@/models/OtpToken';
import { sendOtpEmail } from './mailer';

/**
 * Email one-time codes. The same flow signs up and signs in: the first
 * successful verification for an unseen address creates the account.
 *
 * A 6-digit code is only ~20 bits, so the protection is not the code's entropy
 * but the limits around it — short expiry, single use, a hard attempt cap, and
 * a request cap per address.
 */

const CODE_LENGTH = 6;
export const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
/** Requests allowed per address inside the window, so this cannot be used to mail-bomb. */
const MAX_REQUESTS_PER_WINDOW = 5;
const REQUEST_WINDOW_MINUTES = 15;

export class OtpError extends Error {}

function generateCode(): string {
  // randomInt is CSPRNG-backed; Math.random would be predictable.
  return String(randomInt(0, 10 ** CODE_LENGTH)).padStart(CODE_LENGTH, '0');
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Issues a code and emails it. Returns nothing about whether the address is
 * already registered — the caller must answer identically either way, so this
 * cannot be used to enumerate customers.
 */
export async function requestOtp(rawEmail: string): Promise<void> {
  const email = normaliseEmail(rawEmail);
  await dbConnect();

  const since = new Date(Date.now() - REQUEST_WINDOW_MINUTES * 60_000);
  const recent = await OtpToken.countDocuments({ email, createdAt: { $gte: since } });
  if (recent >= MAX_REQUESTS_PER_WINDOW) {
    throw new OtpError(
      `Too many codes requested. Wait ${REQUEST_WINDOW_MINUTES} minutes and try again.`,
    );
  }

  // Retire any outstanding codes so only the newest one works.
  await OtpToken.updateMany({ email, consumedAt: null }, { $set: { consumedAt: new Date() } });

  const code = generateCode();
  await OtpToken.create({
    email,
    codeHash: await hash(code, 10),
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
  });

  await sendOtpEmail(email, code, OTP_TTL_MINUTES);
}

/**
 * Verifies a code and returns the customer, creating one on first sign-in.
 * Throws OtpError with a message safe to show the user.
 */
export async function verifyOtp(
  rawEmail: string,
  rawCode: string,
): Promise<{ id: string; email: string; isNew: boolean }> {
  const email = normaliseEmail(rawEmail);
  const code = rawCode.trim();
  await dbConnect();

  const token = await OtpToken.findOne({ email, consumedAt: null }).sort({ createdAt: -1 });

  if (!token || token.expiresAt.getTime() < Date.now()) {
    throw new OtpError('That code has expired. Request a new one.');
  }

  if (token.attempts >= MAX_ATTEMPTS) {
    token.consumedAt = new Date();
    await token.save();
    throw new OtpError('Too many incorrect attempts. Request a new code.');
  }

  const matches = await compare(code, token.codeHash);
  if (!matches) {
    token.attempts += 1;
    await token.save();
    const left = MAX_ATTEMPTS - token.attempts;
    throw new OtpError(
      left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many incorrect attempts. Request a new code.',
    );
  }

  // Single use: burn it before issuing a session.
  token.consumedAt = new Date();
  await token.save();

  const existing = await Customer.findOne({ email });
  if (existing) {
    existing.lastLoginAt = new Date();
    await existing.save();
    return { id: String(existing._id), email: existing.email, isNew: false };
  }

  const created = await Customer.create({ email, lastLoginAt: new Date() });
  return { id: String(created._id), email: created.email, isNew: true };
}
