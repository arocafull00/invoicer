import { clerkMiddleware } from '@clerk/nextjs/server';

const publicRoutes = new Set([
  '/login',
  '/sso-callback',
  '/terms',
  '/privacy',
]);

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.has(pathname);
  const isApiRoute = pathname === '/api' || pathname.startsWith('/api/');

  if (!isPublicRoute && !isApiRoute) {
    const { isAuthenticated, redirectToSignIn } = await auth();
    if (!isAuthenticated) {
      return redirectToSignIn();
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api)(.*)',
  ],
};
