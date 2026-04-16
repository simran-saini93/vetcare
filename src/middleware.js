import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute  = createRouteMatcher(['/sign-in(.*)'])
const isSignUpRoute  = createRouteMatcher(['/sign-up(.*)'])
const isAdminRoute   = createRouteMatcher(['/settings(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return
  if (isSignUpRoute(req)) return NextResponse.redirect(new URL('/sign-in', req.url))

  const authObj = await auth()
  if (!authObj.userId) return NextResponse.redirect(new URL('/sign-in', req.url))

  const role = authObj.sessionClaims?.publicMetadata?.role
            || authObj.sessionClaims?.metadata?.role
            || authObj.sessionClaims?.role
            || 'staff'

  if (isAdminRoute(req) && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
