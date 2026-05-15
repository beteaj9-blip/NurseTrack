import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes and static assets
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // TODO: Implement actual JWT verification logic here once backend is ready.
  // For Phase 1 mockup, we bypass middleware.
  // Example future logic:
  // const token = request.cookies.get('token')?.value;
  // if (!token) return NextResponse.redirect(new URL('/login', request.url));
  // const payload = decodeJwt(token);
  // if (!pathname.startsWith(`/${payload.role.toLowerCase()}`)) return NextResponse.rewrite(new URL('/404', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
