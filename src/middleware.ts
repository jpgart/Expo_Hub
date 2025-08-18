// Temporarily disabled Clerk authentication
// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

// Temporarily bypass authentication
export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// Original Clerk middleware (commented out for now):
// export default clerkMiddleware(async (auth, req: NextRequest) => {
//   if (isProtectedRoute(req)) await auth.protect();
// });
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
