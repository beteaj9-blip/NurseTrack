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

  // Auth redirects are handled in the dashboard shell because the JWT is stored client-side.
  // Example server-side flow if the token is later moved to cookies:
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
