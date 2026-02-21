import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  const response = NextResponse.next();

  // Set CORS headers - allow any origin securely
  const allowOrigin = origin || '*';
  response.headers.set('Access-Control-Allow-Origin', allowOrigin);

  if (allowOrigin !== '*') {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-org-slug, x-org-id'
  );

  // Handle preflight requests (OPTIONS method)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

// Optional: Configure the middleware to run only on specific paths (e.g., API routes)
export const config = {
  matcher: '/api/:path*', // This applies the middleware only to routes starting with /api
};