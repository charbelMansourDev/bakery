import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import { createSessionCookie } from '@/lib/session';
import { loginSchema } from '@/lib/validation';

// A bcrypt hash of a random string. Compared against when the username does not
// exist, so a wrong username and a wrong password take the same time to reject.
const DUMMY_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
  }

  const { username, password } = parsed.data;

  await dbConnect();
  const admin = await Admin.findOne({ username }).lean<{ _id: unknown; username: string; passwordHash: string } | null>();

  const matches = await compare(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !matches) {
    return NextResponse.json({ error: 'Incorrect username or password.' }, { status: 401 });
  }

  await createSessionCookie({ sub: String(admin._id), username: admin.username });
  return NextResponse.json({ ok: true });
}
