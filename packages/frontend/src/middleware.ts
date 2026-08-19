import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/auth/login', '/auth/register', '/portfolio/slug/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has('auth-storage');

  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p));
  const isStatic = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.');

  if (isStatic || isPublic) return NextResponse.next();

  const authStorage = request.cookies.get('auth-storage')?.value;
  if (!authStorage || !authStorage.includes('"isAuthenticated":true')) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
