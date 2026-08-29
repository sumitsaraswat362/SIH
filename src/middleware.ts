import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'annapurna_hackathon_super_secret');

// Add routes that require authentication
const protectedRoutes = ['/fleet', '/wholesaler'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtected) {
    const token = request.cookies.get('annapurna_session')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    try {
      // Verify JWT on the edge
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/fleet/:path*', '/wholesaler/:path*'],
};
