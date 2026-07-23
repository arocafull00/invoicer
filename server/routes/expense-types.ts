import type { Hono } from 'hono';
import type { AppEnv } from '../lib/auth.js';
import type { Sql } from '../lib/db.js';
import { ApiError } from '../lib/errors.js';

type ExpenseTypeBody = {
  name?: string;
};

export function registerExpenseTypeRoutes(app: Hono<AppEnv>, sql: Sql) {
  app.get('/expense-types', async (c) => {
    const userId = c.get('userId');
    const rows = await sql`
      SELECT * FROM expense_types
      WHERE user_id = ${userId}
      ORDER BY name ASC
    `;
    return c.json(rows);
  });

  app.post('/expense-types', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json<ExpenseTypeBody>();
    const name = body.name?.trim();
    if (!name) throw new ApiError('Name is required', 400);

    try {
      const rows = await sql`
        INSERT INTO expense_types (name, user_id)
        VALUES (${name}, ${userId})
        RETURNING *
      `;
      return c.json(rows[0], 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('unique') || message.includes('duplicate key')) {
        throw new ApiError('Ya existe un tipo de gasto con ese nombre', 409);
      }
      throw error;
    }
  });
}
