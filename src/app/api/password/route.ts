import { NextResponse } from 'next/server';

const STORE_PASSWORD = process.env.STORE_PASSWORD || '';

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!STORE_PASSWORD || password !== STORE_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('store_access', 'granted', {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    httpOnly: true,
  });

  return response;
}
