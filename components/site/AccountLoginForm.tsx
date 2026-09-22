'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const FIELD =
  'mt-2 w-full rounded-lg border border-walnut/20 bg-cream-50 px-4 py-3.5 text-sm text-walnut placeholder:text-walnut-400/70 focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-none';

/**
 * Two steps, one flow: an address gets a code, the code creates the session.
 * Signing up and signing in are the same path — the first verified code for an
 * unseen address creates the account.
 */
export default function AccountLoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestCode(event?: React.FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const response = await fetch('/api/account/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? 'Could not send the code.');
      setBusy(false);
      return;
    }

    setStep('code');
    setNotice(`We sent a 6-digit code to ${email}.`);
    setBusy(false);
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const response = await fetch('/api/account/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? 'That code did not work.');
      setBusy(false);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <div className="rounded-xl bg-cream-50 p-8 shadow-soft">
      {step === 'email' ? (
        <form onSubmit={requestCode}>
          <label htmlFor="email" className="eyebrow text-walnut-400">
            Your email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            className={FIELD}
          />
          <p className="mt-2 text-xs text-walnut-400">
            We&rsquo;ll send a code. No password to remember.
          </p>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="mt-6 w-full rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold tracking-wide text-walnut transition hover:bg-gold-300 disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send me a code'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode}>
          <label htmlFor="code" className="eyebrow text-walnut-400">
            Your 6-digit code
          </label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            required
            autoFocus
            className={`${FIELD} text-center font-display text-2xl tracking-[0.4em]`}
          />

          {notice && !error && <p className="mt-3 text-xs text-walnut-400">{notice}</p>}

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="mt-6 w-full rounded-lg bg-gold px-6 py-3.5 text-sm font-semibold tracking-wide text-walnut transition hover:bg-gold-300 disabled:opacity-50"
          >
            {busy ? 'Checking…' : 'Sign in'}
          </button>

          <div className="mt-5 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError(null);
                setNotice(null);
              }}
              className="text-walnut-400 underline underline-offset-4 transition hover:text-walnut"
            >
              Use a different email
            </button>
            <button
              type="button"
              onClick={() => requestCode()}
              disabled={busy}
              className="text-walnut-400 underline underline-offset-4 transition hover:text-walnut disabled:opacity-50"
            >
              Resend code
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
