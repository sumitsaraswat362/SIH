import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import crypto from 'crypto';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'annapurna_hackathon_super_secret');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, password, phone, location, city, address, state, district, village, buyerType, coords } = body;

    if (!name || !role) {
      return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });
    }

    // Generate a deterministic user ID from name+role for demo consistency
    const id = `${role}-${crypto.createHash('md5').update(name.toLowerCase().trim()).digest('hex').slice(0, 8)}`;

    const user = { id, name, role, phone, location, city, address, state, district, village, buyerType, coords };

    const token = await new SignJWT(user)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true, user });

    response.cookies.set({
      name: 'annapurna_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
