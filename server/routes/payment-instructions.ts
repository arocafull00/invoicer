import type { Hono } from 'hono';
import type { Sql } from '../lib/db.js';
import { ApiError } from '../lib/errors.js';

type PaymentInstructionBody = {
  account_holder: string;
  iban: string;
  payment_method: string;
  payment_terms: string;
  additional_data: string;
};

export function registerPaymentInstructionRoutes(app: Hono, sql: Sql) {
  app.get('/payment-instructions', async (c) => {
    const rows = await sql`SELECT * FROM payment_instructions ORDER BY account_holder ASC`;
    return c.json(rows);
  });

  app.post('/payment-instructions', async (c) => {
    const body = await c.req.json<PaymentInstructionBody>();
    const rows = await sql`
      INSERT INTO payment_instructions (
        account_holder, iban, payment_method, payment_terms, additional_data
      )
      VALUES (
        ${body.account_holder},
        ${body.iban},
        ${body.payment_method},
        ${body.payment_terms},
        ${body.additional_data}
      )
      RETURNING *
    `;
    return c.json(rows[0], 201);
  });

  app.put('/payment-instructions/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<PaymentInstructionBody>>();
    const rows = await sql`
      UPDATE payment_instructions SET
        account_holder = COALESCE(${body.account_holder ?? null}, account_holder),
        iban = COALESCE(${body.iban ?? null}, iban),
        payment_method = COALESCE(${body.payment_method ?? null}, payment_method),
        payment_terms = COALESCE(${body.payment_terms ?? null}, payment_terms),
        additional_data = COALESCE(${body.additional_data ?? null}, additional_data)
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows[0]) throw new ApiError('Payment instruction not found', 404);
    return c.json(rows[0]);
  });

  app.delete('/payment-instructions/:id', async (c) => {
    const id = c.req.param('id');
    const rows = await sql`DELETE FROM payment_instructions WHERE id = ${id} RETURNING id`;
    if (!rows[0]) throw new ApiError('Payment instruction not found', 404);
    return c.body(null, 204);
  });
}
