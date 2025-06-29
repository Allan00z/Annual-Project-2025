import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected paths that require origin checking
const protectedPaths = ['/api/mail'];

// Middleware function to check the origin of requests
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
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
  matcher: ['/api/mail/:path*']
};
