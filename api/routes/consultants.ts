import type { Hono } from 'hono';
import type { Sql } from '../lib/db';
import { ApiError, isUniqueViolation } from '../lib/errors';

type ConsultantBody = {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  nif: string;
};

export function registerConsultantRoutes(app: Hono, sql: Sql) {
  app.get('/consultants', async (c) => {
    const rows = await sql`SELECT * FROM consultants ORDER BY name ASC`;
    return c.json(rows);
  });

  app.post('/consultants', async (c) => {
    const body = await c.req.json<ConsultantBody>();
    try {
      const rows = await sql`
        INSERT INTO consultants (name, email, address, city, country, nif)
        VALUES (${body.name}, ${body.email}, ${body.address}, ${body.city}, ${body.country}, ${body.nif})
        RETURNING *
      `;
      return c.json(rows[0], 201);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ApiError('Consultant email already exists', 409);
      }
      throw error;
    }
  });

  app.put('/consultants/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<ConsultantBody>>();
    const rows = await sql`
      UPDATE consultants SET
        name = COALESCE(${body.name ?? null}, name),
        email = COALESCE(${body.email ?? null}, email),
        address = COALESCE(${body.address ?? null}, address),
        city = COALESCE(${body.city ?? null}, city),
        country = COALESCE(${body.country ?? null}, country),
        nif = COALESCE(${body.nif ?? null}, nif)
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows[0]) throw new ApiError('Consultant not found', 404);
    return c.json(rows[0]);
  });

  app.delete('/consultants/:id', async (c) => {
    const id = c.req.param('id');
    const rows = await sql`DELETE FROM consultants WHERE id = ${id} RETURNING id`;
    if (!rows[0]) throw new ApiError('Consultant not found', 404);
    return c.body(null, 204);
  });
}
