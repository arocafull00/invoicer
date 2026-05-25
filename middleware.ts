import { next } from '@vercel/functions/middleware';

export const config = {
  matcher: '/((?!api(?:/|$))(?!_next/static|_next/image|favicon.ico).*)',
};

export default function middleware(req: Request) {
  const auth = req.headers.get('authorization');

  const validUser = process.env.APP_USER;
  const validPass = process.env.APP_PASSWORD;

  if (!auth) {
    return new Response('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  const [, encoded] = auth.split(' ');
  if (!encoded) {
    return new Response('Unauthorized', { status: 401 });
  }

  const decoded = atob(encoded);
  const [user, pass] = decoded.split(':');

  if (user === validUser && pass === validPass) {
    return next();
  }

  return new Response('Unauthorized', { status: 401 });
}
