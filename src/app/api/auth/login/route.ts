import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'annapurna_hackathon_super_secret');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, password, location, city, address, coords } = body;

    if (!name || !role) {
      return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });
    }

    // In a real app, verify password against DB. Here we accept any valid structured request 
    // to match the hackathon demo flow, but we secure it on the server using JWT cookies.
    const user = { name, role, location, city, address, coords };

    // Sign JWT token
    const token = await new SignJWT(user)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true, user });
    
    // Set HTTP-only secure cookie
    response.cookies.set({
      name: 'annapurna_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
