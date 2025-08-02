// middleware.ts (in the root of your project)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // THIS IS THE TEST LINE
  console.log('MIDDLEWARE IS RUNNING FOR PATH:', request.nextUrl.pathname);

  // ... rest of your middleware code
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;
  const publicPaths = ['/login', '/signup']; 

  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (token && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};