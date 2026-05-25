import type { Plugin } from 'vite';

function isAuthorized(auth: string | undefined) {
  const validUser = process.env.APP_USER;
  const validPass = process.env.APP_PASSWORD;

  if (!auth) return false;

  const [, encoded] = auth.split(' ');
  if (!encoded) return false;

  const decoded = atob(encoded);
  const [user, pass] = decoded.split(':');

  return user === validUser && pass === validPass;
}

export function viteBasicAuth(): Plugin {
  return {
    name: 'vite-basic-auth',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api')) {
          next();
          return;
        }

        if (isAuthorized(req.headers.authorization)) {
          next();
          return;
        }

        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        res.end('Auth required');
      });
    },
  };
}
