// ── F013 · src/middleware.ts
// Purpose: Route protection via veda_session cookie presence; role gate via veda_role plain cookie
// In: veda_session cookie, veda_role cookie | Out: NextResponse (next/redirect/403) | See: F011, F050
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Role-based page gates — checked against the sealed session role stored in the cookie.
// Since we can't unseal iron-session in middleware without a full crypto pass, we gate
// by reading the plain-text role cookie we set alongside the sealed session.
// See login route: we set a separate httpOnly=false role cookie for this purpose.
const ROLE_GATES: Record<string, string[]> = {
  '/settings':  ['ADMIN'],
  '/audit-log': ['ADMIN'],
  '/analytics': ['ADMIN'],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always pass Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // Always pass API routes — each route handler does its own session check
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('veda_session')
  const isLoggedIn = !!sessionCookie?.value

  // Redirect root to dashboard (or login if not authenticated)
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(isLoggedIn ? '/dashboard' : '/login', request.url),
    )
  }

  const isLoginPath = pathname === '/login'

  // Logged-in user hitting /login → bounce to dashboard
  if (isLoggedIn && isLoginPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Not logged in hitting protected path → /login?next=
  if (!isLoggedIn && !isLoginPath) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role gate — role stored in a small non-sealed cookie alongside the session
  if (isLoggedIn) {
    const role = request.cookies.get('veda_role')?.value ?? 'RECEPTIONIST'
    for (const [guardPath, allowed] of Object.entries(ROLE_GATES)) {
      if (pathname.startsWith(guardPath) && !allowed.includes(role)) {
        return new NextResponse(
          `<html><body style="font-family:sans-serif;padding:2rem;color:#111">
            <h2 style="color:#dc2626">Access denied</h2>
            <p>Your role (<strong>${role}</strong>) cannot access this page.</p>
            <a href="/dashboard" style="color:#0d9488">← Back to dashboard</a>
          </body></html>`,
          { status: 403, headers: { 'Content-Type': 'text/html' } },
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
