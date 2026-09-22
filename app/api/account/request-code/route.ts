import { NextResponse } from 'next/server';
import { OtpError, requestOtp } from '@/lib/otp';
import { requestCodeSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const parsed = requestCodeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Enter a valid email address.' },
      { status: 400 },
    );
  }

  try {
    await requestOtp(parsed.data.email);
  } catch (err) {
    if (err instanceof OtpError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    return NextResponse.json({ error: 'Could not send the code. Try again.' }, { status: 500 });
  }

  // Deliberately identical whether or not the address is already registered,
  // so this endpoint cannot be used to discover who has an account.
  return NextResponse.json({ ok: true });
}
