import type { Hono } from 'hono';
import type { Sql } from '../lib/db.js';
import { ApiError } from '../lib/errors.js';
import { mapLineItemTemplate } from '../lib/mappers.js';

type TemplateBody = {
  description: string;
  default_quantity: number;
  default_rate: number;
  category?: string;
};

export function registerLineItemTemplateRoutes(app: Hono, sql: Sql) {
  app.get('/line-item-templates', async (c) => {
    const rows = await sql`
      SELECT * FROM line_item_templates ORDER BY usage_count DESC
    `;
    return c.json(rows.map(mapLineItemTemplate));
  });

  app.post('/line-item-templates', async (c) => {
    const body = await c.req.json<TemplateBody>();
    const rows = await sql`
      INSERT INTO line_item_templates (
        description, default_quantity, default_rate, category, usage_count
      )
      VALUES (
        ${body.description},
        ${body.default_quantity},
        ${body.default_rate},
        ${body.category ?? null},
        0
      )
      RETURNING *
    `;
    return c.json(mapLineItemTemplate(rows[0]), 201);
  });

  app.put('/line-item-templates/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<TemplateBody>>();
    const rows = await sql`
      UPDATE line_item_templates SET
        description = COALESCE(${body.description ?? null}, description),
        default_quantity = COALESCE(${body.default_quantity ?? null}, default_quantity),
        default_rate = COALESCE(${body.default_rate ?? null}, default_rate),
        category = COALESCE(${body.category ?? null}, category)
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows[0]) throw new ApiError('Template not found', 404);
    return c.json(mapLineItemTemplate(rows[0]));
  });

  app.delete('/line-item-templates/:id', async (c) => {
    const id = c.req.param('id');
    const rows = await sql`DELETE FROM line_item_templates WHERE id = ${id} RETURNING id`;
    if (!rows[0]) throw new ApiError('Template not found', 404);
    return c.body(null, 204);
  });

  app.post('/line-item-templates/:id/usage', async (c) => {
    const id = c.req.param('id');
    await sql`SELECT update_template_usage(${id}::uuid)`;
    return c.body(null, 204);
  });
}
