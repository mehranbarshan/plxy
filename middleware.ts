import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the JWT. If it's invalid, it will throw an error.
    await jwtVerify(session, secret);
    
    // If token is valid, continue to the requested page.
    return NextResponse.next();
  } catch (err) {
    // If verification fails, redirect to login.
    console.error('JWT Verification Error:', err);
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear the invalid cookie
    response.cookies.set('session', '', { expires: new Date(0) });
    return response;
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - signup (signup page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)',
  ],
};
