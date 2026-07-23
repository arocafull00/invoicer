import type { Hono } from 'hono';
import type { AppEnv } from '../lib/auth.js';
import type { Sql } from '../lib/db.js';
import { ApiError } from '../lib/errors.js';

type ClientBody = {
  name?: string;
  email?: string | null;
  address?: string;
  city?: string;
  country?: string;
  company_number?: string | null;
};

export function registerClientRoutes(app: Hono<AppEnv>, sql: Sql) {
  app.get('/clients', async (c) => {
    const userId = c.get('userId');
    const rows = await sql`
      SELECT * FROM clients
      WHERE user_id = ${userId}
      ORDER BY name ASC
    `;
    return c.json(rows);
  });

  app.post('/clients', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json<ClientBody>();
    const rows = await sql`
      INSERT INTO clients (name, email, address, city, country, company_number, user_id)
      VALUES (
        ${body.name ?? ''},
        ${body.email ?? ''},
        ${body.address ?? ''},
        ${body.city ?? ''},
        ${body.country ?? ''},
        ${body.company_number ?? null},
        ${userId}
      )
      RETURNING *
    `;
    return c.json(rows[0], 201);
  });

  app.put('/clients/:id', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = await c.req.json<ClientBody>();
    const rows = await sql`
      UPDATE clients SET
        name = COALESCE(${body.name ?? null}, name),
        email = COALESCE(${body.email ?? null}, email),
        address = COALESCE(${body.address ?? null}, address),
        city = COALESCE(${body.city ?? null}, city),
        country = COALESCE(${body.country ?? null}, country),
        company_number = COALESCE(${body.company_number ?? null}, company_number)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    if (!rows[0]) throw new ApiError('Client not found', 404);
    return c.json(rows[0]);
  });

  app.delete('/clients/:id', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const rows = await sql`
      DELETE FROM clients
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    if (!rows[0]) throw new ApiError('Client not found', 404);
    return c.body(null, 204);
  });
}
