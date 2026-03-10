import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Countries we ship to and have VAT rates for
const SUPPORTED_COUNTRIES = new Set(['LU', 'FR', 'BE', 'DE']);

// Store password protection (set STORE_PASSWORD in .env.local to enable)
const STORE_PASSWORD = process.env.STORE_PASSWORD || '';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Password gate — skip for the password page itself and API routes
  if (STORE_PASSWORD && pathname !== '/password') {
    const hasAccess = request.cookies.get('store_access')?.value === 'granted';
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/password', request.url));
    }
  }

  const response = NextResponse.next();

  // Only set cookie if not already present (first visit)
  if (!request.cookies.get('geo_country')) {
    // Vercel injects this header automatically on deployed environments
    const country = request.headers.get('x-vercel-ip-country') || 'LU';
    const resolved = SUPPORTED_COUNTRIES.has(country) ? country : 'LU';

    response.cookies.set('geo_country', resolved, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  // Run on all pages, skip static assets and API routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
};
