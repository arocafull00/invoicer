import type { Hono } from 'hono';
import type { AppEnv } from '../lib/auth.js';
import type { Sql } from '../lib/db.js';
import { ApiError, isUniqueViolation } from '../lib/errors.js';

type ConsultantBody = {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  nif: string;
};

export function registerConsultantRoutes(app: Hono<AppEnv>, sql: Sql) {
  app.get('/consultants', async (c) => {
    const userId = c.get('userId');
    const rows = await sql`
      SELECT * FROM consultants
      WHERE user_id = ${userId}
      ORDER BY name ASC
    `;
    return c.json(rows);
  });

  app.post('/consultants', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json<ConsultantBody>();
    try {
      const rows = await sql`
        INSERT INTO consultants (name, email, address, city, country, nif, user_id)
        VALUES (
          ${body.name},
          ${body.email},
          ${body.address},
          ${body.city},
          ${body.country},
          ${body.nif},
          ${userId}
        )
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
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = await c.req.json<Partial<ConsultantBody>>();
    try {
      const rows = await sql`
        UPDATE consultants SET
          name = COALESCE(${body.name ?? null}, name),
          email = COALESCE(${body.email ?? null}, email),
          address = COALESCE(${body.address ?? null}, address),
          city = COALESCE(${body.city ?? null}, city),
          country = COALESCE(${body.country ?? null}, country),
          nif = COALESCE(${body.nif ?? null}, nif)
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;
      if (!rows[0]) throw new ApiError('Consultant not found', 404);
      return c.json(rows[0]);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (isUniqueViolation(error)) {
        throw new ApiError('Consultant email already exists', 409);
      }
      throw error;
    }
  });

  app.delete('/consultants/:id', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const rows = await sql`
      DELETE FROM consultants
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    if (!rows[0]) throw new ApiError('Consultant not found', 404);
    return c.body(null, 204);
  });
}
