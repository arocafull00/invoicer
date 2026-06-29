import type { MiddlewareHandler } from 'hono';

export function basicAuth(): MiddlewareHandler {
  return async (c, next) => {
    const auth = c.req.header('authorization');
    const validUser = process.env.APP_USER;
    const validPass = process.env.APP_PASSWORD;

    if (!auth) {
      return c.text('Auth required', 401, {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      });
    }

    const [, encoded] = auth.split(' ');
    if (!encoded) {
      return c.text('Unauthorized', 401);
    }

    const decoded = atob(encoded);
    const [user, pass] = decoded.split(':');

    if (user !== validUser || pass !== validPass) {
      return c.text('Unauthorized', 401);
    }

    await next();
  };
}
