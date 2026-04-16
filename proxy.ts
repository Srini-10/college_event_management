import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth routing is handled entirely on the client by AuthProvider.
// Firebase stores its session in IndexedDB/localStorage — not in HTTP cookies —
// so there is no server-readable auth signal to gate routes on here.
// Any server-side cookie check would block all authenticated users and cause
// a redirect loop (proxy → /login, AuthProvider → /events, repeat).
export function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
