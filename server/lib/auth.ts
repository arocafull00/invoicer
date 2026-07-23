import { verifyToken } from '@clerk/backend';
import type { MiddlewareHandler } from 'hono';

export type AuthVariables = {
  userId: string;
};

export type AppEnv = {
  Variables: AuthVariables;
};

export function clerkAuth(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const auth = c.req.header('authorization');

    if (!auth?.startsWith('Bearer ')) {
      return c.text('Unauthorized', 401);
    }

    const token = auth.slice('Bearer '.length).trim();
    if (!token) {
      return c.text('Unauthorized', 401);
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      return c.text('Unauthorized', 401);
    }

    try {
      const payload = await verifyToken(token, { secretKey });
      c.set('userId', payload.sub);
      await next();
    } catch {
      return c.text('Unauthorized', 401);
    }
  };
}
