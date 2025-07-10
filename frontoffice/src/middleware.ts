import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected paths that require origin checking
const protectedPaths = ['/api/mail'];

// Admin paths that require owner role
const adminPaths = ['/admin'];

// Middleware function to check the origin of requests and admin access
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if this is an admin route
  const isAdminPath = adminPaths.some(adminPath => path.startsWith(adminPath));
  
  if (isAdminPath) {
    // Check if user is authenticated and has owner role
    const jwt = request.cookies.get('jwt')?.value;
    
    if (!jwt) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Check user role
      const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
      const response = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        // Redirect to login if token is invalid
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const userData = await response.json();
      
      if (userData.role?.type !== 'owner') {
        // Redirect to home if not owner
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Check if the request path is one of the protected paths
  const isProtectedPath = protectedPaths.some(protectedPath => path.startsWith(protectedPath));
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // Check the origin or referer header
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!appUrl) {
    return NextResponse.json(
      { error: 'Configuration du serveur incorrecte' },
      { status: 500 }
    );
  }
  
  // Check if the request comes from the allowed origin or referer
  const isAllowedOrigin = 
    (origin && origin === appUrl) || 
    (referer && referer.startsWith(appUrl));
  
  if (!isAllowedOrigin) {
    return NextResponse.json(
      { error: 'Origine non autorisée' },
      { status: 403 }
    );
  }
  
  return NextResponse.next();
}

// Apply the middleware to the specified paths
export const config = {
  matcher: ['/api/mail/:path*', '/admin/:path*']
};
