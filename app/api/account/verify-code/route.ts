import { NextResponse } from 'next/server';
import { OtpError, verifyOtp } from '@/lib/otp';
import { createCustomerSession } from '@/lib/session';
import { verifyCodeSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const parsed = verifyCodeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid code.' },
      { status: 400 },
    );
  }

  try {
    const customer = await verifyOtp(parsed.data.email, parsed.data.code);
    await createCustomerSession({ sub: customer.id, email: customer.email });
    return NextResponse.json({ ok: true, isNew: customer.isNew });
  } catch (err) {
    if (err instanceof OtpError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Could not sign you in. Try again.' }, { status: 500 });
  }
}
