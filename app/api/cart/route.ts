import { NextResponse } from 'next/server';
import { requireCustomerApi } from '@/lib/auth';
import { CartError, clearCart, getCart, replaceCart } from '@/lib/cart';
import { cartReplaceSchema } from '@/lib/validation';

export async function GET() {
  const auth = await requireCustomerApi();
  if (!auth.ok) return auth.response;

  try {
    return NextResponse.json({ cart: await getCart(auth.session.sub) });
  } catch {
    return NextResponse.json({ error: 'Could not load your cart.' }, { status: 500 });
  }
}

/** Replaces the whole cart — the client sends the state it wants, not a diff. */
export async function PUT(request: Request) {
  const auth = await requireCustomerApi();
  if (!auth.ok) return auth.response;

  const parsed = cartReplaceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid cart.' },
      { status: 400 },
    );
  }

  try {
    const cart = await replaceCart(auth.session.sub, parsed.data);
    return NextResponse.json({ cart });
  } catch (err) {
    if (err instanceof CartError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Could not update your cart.' }, { status: 500 });
  }
}

export async function DELETE() {
  const auth = await requireCustomerApi();
  if (!auth.ok) return auth.response;

  try {
    return NextResponse.json({ cart: await clearCart(auth.session.sub) });
  } catch {
    return NextResponse.json({ error: 'Could not clear your cart.' }, { status: 500 });
  }
}
