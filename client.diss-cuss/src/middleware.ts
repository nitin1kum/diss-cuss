import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt"

export { default } from 'next-auth/middleware'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const url = request.nextUrl

  // If token exists and trying to access auth pages → redirect to home
  if (
    token &&
    (url.pathname.startsWith('/auth/sign-in') ||
     url.pathname.startsWith('/auth/sign-up') ||
     url.pathname.startsWith('/auth/verify'))
  ) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If token does not exist and trying to access protected auth pages → allow
  if (!token && url.pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // If no token and trying to access a protected page outside auth → redirect to sign-in
  if (!token) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  // If token exists and path is fine → allow
  return NextResponse.next()
}

 
// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/auth/:path*'],
}