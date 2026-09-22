import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { BAKERY } from './config';

/**
 * Nodemailer over SMTP.
 *
 * With no SMTP_HOST configured, development logs the message to the server
 * console instead of sending, so the sign-in flow is testable without
 * credentials. Production refuses to fall back — silently not sending a login
 * code would lock every customer out with no visible error.
 */

let cached: Transporter | null = null;

function isConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function transporter(): Transporter {
  if (cached) return cached;

  const port = Number(process.env.SMTP_PORT ?? 587);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 is implicit TLS; 587 upgrades with STARTTLS.
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  return cached;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  if (!isConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASSWORD.');
    }
    console.info(
      `\n--- email (not sent: SMTP not configured) ---\nto: ${options.to}\nsubject: ${options.subject}\n\n${options.text}\n--------------------------------------------\n`,
    );
    return;
  }

  await transporter().sendMail({
    from: process.env.SMTP_FROM ?? `${BAKERY.name} <${BAKERY.email}>`,
    ...options,
  });
}

/** The sign-in code email. Plain text alongside HTML, for clients that refuse it. */
export async function sendOtpEmail(to: string, code: string, minutes: number): Promise<void> {
  const text = [
    `Your ${BAKERY.name} sign-in code is ${code}.`,
    ``,
    `It expires in ${minutes} minutes and can be used once.`,
    `If you did not ask to sign in, you can ignore this email.`,
  ].join('\n');

  const html = `
<div style="font-family:Georgia,'Times New Roman',serif;background:#f6f1e7;padding:40px 24px;color:#4a3126">
  <div style="max-width:440px;margin:0 auto;background:#fdfbf7;border:1px solid #ece3d2;border-radius:12px;padding:36px 32px;text-align:center">
    <p style="margin:0;font-size:22px;letter-spacing:-0.01em">${BAKERY.name}</p>
    <p style="margin:4px 0 28px;font-style:italic;font-size:13px;color:#8a6a58">${BAKERY.tagline}</p>
    <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8a6a58">Your sign-in code</p>
    <p style="margin:0;font-size:38px;letter-spacing:0.22em;color:#4a3126"><strong>${code}</strong></p>
    <p style="margin:24px 0 0;font-size:13px;color:#8a6a58">
      Expires in ${minutes} minutes, and can be used once.
    </p>
    <p style="margin:20px 0 0;font-size:12px;color:#8a6a58">
      If you did not ask to sign in, you can ignore this email.
    </p>
  </div>
</div>`.trim();

  await sendMail({ to, subject: `${code} is your ${BAKERY.name} sign-in code`, text, html });
}

export { isConfigured as isMailConfigured };
