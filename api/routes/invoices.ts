import type { Hono } from 'hono';
import type { Sql } from '../lib/db';
import { ApiError } from '../lib/errors';
import { mapInvoice } from '../lib/mappers';

type LineItemInput = {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  total?: number;
  includeVat?: boolean;
};

type InvoiceInput = {
  number: string;
  created_date: string;
  start_date: string;
  end_date: string;
  consultant: { id: string };
  client: { id: string };
  payment_instructions: { id: string };
  description?: string;
  line_items?: LineItemInput[];
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  vat_exempt: boolean;
  status: string;
  irpf_rate?: number | null;
  irpf_amount?: number | null;
};

type InvoiceRow = Parameters<typeof mapInvoice>[0];

async function fetchAllInvoices(sql: Sql) {
  const rows = await sql`
    SELECT
      i.*,
      row_to_json(c.*) AS consultant,
      row_to_json(cl.*) AS client,
      row_to_json(pi.*) AS payment_instructions,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', li.id,
              'description', li.description,
              'quantity', li.quantity,
              'rate', li.rate,
              'total', li.total,
              'include_vat', li.include_vat,
              'order_index', li.order_index
            )
            ORDER BY li.order_index
          )
          FROM invoice_line_items li
          WHERE li.invoice_id = i.id
        ),
        '[]'::json
      ) AS line_items
    FROM invoices i
    LEFT JOIN consultants c ON c.id = i.consultant_id
    LEFT JOIN clients cl ON cl.id = i.client_id
    LEFT JOIN payment_instructions pi ON pi.id = i.payment_instructions_id
    WHERE COALESCE(i.deleted, false) = false
    ORDER BY i.created_date DESC
  `;
  return rows.map((row) => mapInvoice(row as InvoiceRow));
}

async function fetchInvoiceById(sql: Sql, id: string) {
  const rows = await sql`
    SELECT
      i.*,
      row_to_json(c.*) AS consultant,
      row_to_json(cl.*) AS client,
      row_to_json(pi.*) AS payment_instructions,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', li.id,
              'description', li.description,
              'quantity', li.quantity,
              'rate', li.rate,
              'total', li.total,
              'include_vat', li.include_vat,
              'order_index', li.order_index
            )
            ORDER BY li.order_index
          )
          FROM invoice_line_items li
          WHERE li.invoice_id = i.id
        ),
        '[]'::json
      ) AS line_items
    FROM invoices i
    LEFT JOIN consultants c ON c.id = i.consultant_id
    LEFT JOIN clients cl ON cl.id = i.client_id
    LEFT JOIN payment_instructions pi ON pi.id = i.payment_instructions_id
    WHERE i.id = ${id}
  `;
  return rows[0] ? mapInvoice(rows[0] as InvoiceRow) : null;
}

async function insertLineItems(
  sql: Sql,
  invoiceId: string,
  lineItems: LineItemInput[]
) {
  for (let index = 0; index < lineItems.length; index++) {
    const item = lineItems[index];
    const total = item.total ?? item.quantity * item.rate;
    await sql`
      INSERT INTO invoice_line_items (
        invoice_id, description, quantity, rate, total, include_vat, order_index
      )
      VALUES (
        ${invoiceId},
        ${item.description},
        ${item.quantity},
        ${item.rate},
        ${total},
        ${item.includeVat ?? false},
        ${index}
      )
    `;
  }
}

export function registerInvoiceRoutes(app: Hono, sql: Sql) {
  app.get('/invoices', async (c) => {
    const invoices = await fetchAllInvoices(sql);
    return c.json(invoices);
  });

  app.get('/invoices/next-number', async (c) => {
    const rows = await sql`
      SELECT number FROM invoices WHERE COALESCE(deleted, false) = false
    `;
    return c.json({ number: String(rows.length + 1) });
  });

  app.post('/invoices', async (c) => {
    const body = await c.req.json<InvoiceInput>();
    try {
      const inserted = await sql`
        INSERT INTO invoices (
          number, created_date, start_date, end_date,
          consultant_id, client_id, payment_instructions_id,
          description, subtotal, vat_rate, vat_amount, total,
          vat_exempt, status, irpf_rate, irpf_amount
        )
        VALUES (
          ${body.number},
          ${body.created_date},
          ${body.start_date},
          ${body.end_date},
          ${body.consultant.id},
          ${body.client.id},
          ${body.payment_instructions.id},
          ${body.description ?? ''},
          ${body.subtotal},
          ${body.vat_rate},
          ${body.vat_amount},
          ${body.total},
          ${body.vat_exempt},
          ${body.status},
          ${body.irpf_rate ?? null},
          ${body.irpf_amount ?? null}
        )
        RETURNING id
      `;

      const invoiceId = inserted[0].id as string;
      if (body.line_items?.length) {
        await insertLineItems(sql, invoiceId, body.line_items);
      }

      const invoice = await fetchInvoiceById(sql, invoiceId);
      return c.json(invoice, 201);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : 'Failed to create invoice';
      if (message.includes('unique') || message.includes('duplicate key')) {
        throw new ApiError('No se puede repetir numero de factura', 409);
      }
      throw error;
    }
  });

  app.put('/invoices/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<InvoiceInput>>();

    const rows = await sql`
      UPDATE invoices SET
        number = COALESCE(${body.number ?? null}, number),
        created_date = COALESCE(${body.created_date ?? null}, created_date),
        start_date = COALESCE(${body.start_date ?? null}, start_date),
        end_date = COALESCE(${body.end_date ?? null}, end_date),
        consultant_id = COALESCE(${body.consultant?.id ?? null}, consultant_id),
        client_id = COALESCE(${body.client?.id ?? null}, client_id),
        payment_instructions_id = COALESCE(${body.payment_instructions?.id ?? null}, payment_instructions_id),
        description = COALESCE(${body.description ?? null}, description),
        subtotal = COALESCE(${body.subtotal ?? null}, subtotal),
        vat_rate = COALESCE(${body.vat_rate ?? null}, vat_rate),
        vat_amount = COALESCE(${body.vat_amount ?? null}, vat_amount),
        total = COALESCE(${body.total ?? null}, total),
        vat_exempt = COALESCE(${body.vat_exempt ?? null}, vat_exempt),
        status = COALESCE(${body.status ?? null}, status),
        irpf_rate = COALESCE(${body.irpf_rate ?? null}, irpf_rate),
        irpf_amount = COALESCE(${body.irpf_amount ?? null}, irpf_amount)
      WHERE id = ${id}
      RETURNING id
    `;

    if (!rows[0]) throw new ApiError('Invoice not found', 404);

    if (body.line_items !== undefined) {
      await sql`DELETE FROM invoice_line_items WHERE invoice_id = ${id}`;
      if (body.line_items.length > 0) {
        await insertLineItems(sql, id, body.line_items);
      }
    }

    const invoice = await fetchInvoiceById(sql, id);
    return c.json(invoice);
  });

  app.patch('/invoices/:id/soft-delete', async (c) => {
    const id = c.req.param('id');
    const rows = await sql`
      UPDATE invoices SET deleted = true WHERE id = ${id} RETURNING id
    `;
    if (!rows[0]) throw new ApiError('Invoice not found', 404);
    const invoice = await fetchInvoiceById(sql, id);
    return c.json(invoice);
  });
}
