import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/signin', '/signup', '/api/auth/signin', '/api/auth/signup', '/api/auth/test-account', '/test-toast', '/demo/setup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check for session token
  const sessionToken = request.cookies.get('sessionToken')?.value

  if (!sessionToken) {
    // No session token, redirect to signin
    const signinUrl = new URL('/signin', request.url)
    return NextResponse.redirect(signinUrl)
  }

  // Validate session token (basic validation - in production, use JWT)
  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8')
    const [userId, timestamp] = decoded.split(':')
    
    // Check if token is not expired (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    
    if (tokenAge > maxAge) {
      // Token expired, redirect to signin
      const signinUrl = new URL('/signin', request.url)
      const response = NextResponse.redirect(signinUrl)
      response.cookies.delete('sessionToken')
      return response
    }

    // Token is valid, allow access
    return NextResponse.next()
  } catch (error) {
    // Invalid token format, redirect to signin
    const signinUrl = new URL('/signin', request.url)
    return NextResponse.redirect(signinUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}