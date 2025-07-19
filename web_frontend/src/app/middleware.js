import { NextResponse } from 'next/server';

// List of routes that don't require authentication
const PUBLIC_ROUTES = ['/login'];

export function middleware(request) {
  const token = request.cookies.get('token')?.value || (typeof window !== 'undefined' ? localStorage.getItem('token') : undefined);
  const { pathname } = request.nextUrl;

  // Allow access to public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // If no token, redirect to /login
  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico|logo|api/auth).*)',
  ],
};
