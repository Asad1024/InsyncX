import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const VENDOR_PREFIX = '/vendor';
const ADMIN_PREFIX = '/admin';
const ACCOUNT_PREFIX = '/account';
const AUTH_PREFIX = '/auth';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const path = request.nextUrl.pathname;

  // Auth pages: redirect to role dashboard if already logged in
  if (path.startsWith(AUTH_PREFIX)) {
    if (token) {
      const role = token.role as string;
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
      if (role === 'VENDOR') return NextResponse.redirect(new URL('/vendor', request.url));
      return NextResponse.redirect(new URL('/account', request.url));
    }
    return NextResponse.next();
  }

  // Account: any logged-in user
  if (path.startsWith(ACCOUNT_PREFIX)) {
    if (!token) {
      const login = new URL('/auth/login', request.url);
      login.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  // Vendor: VENDOR or ADMIN only
  if (path.startsWith(VENDOR_PREFIX)) {
    if (!token) {
      const login = new URL('/auth/login', request.url);
      login.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(login);
    }
    const role = token.role as string;
    if (role !== 'VENDOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Admin: ADMIN only
  if (path.startsWith(ADMIN_PREFIX)) {
    if (!token) {
      const login = new URL('/auth/login', request.url);
      login.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(login);
    }
    const role = token.role as string;
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/vendor/:path*',
    '/admin/:path*',
    '/account/:path*',
    '/auth/:path*',
  ],
};
