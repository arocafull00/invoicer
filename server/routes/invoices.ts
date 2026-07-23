import type { Hono } from 'hono';
import type { AppEnv } from '../lib/auth.js';
import type { Sql } from '../lib/db.js';
import { ApiError, isUniqueViolation } from '../lib/errors.js';
import { mapInvoice } from '../lib/mappers.js';

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

type ComputedAmounts = {
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    total: number;
    includeVat: boolean;
  }>;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  vat_exempt: boolean;
  irpf_rate: number | null;
  irpf_amount: number | null;
  total: number;
  description: string;
};

async function fetchAllInvoices(sql: Sql, userId: string) {
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
      AND i.user_id = ${userId}
    ORDER BY i.created_date DESC
  `;
  return rows.map((row) => mapInvoice(row as InvoiceRow));
}

async function fetchInvoiceById(sql: Sql, id: string, userId: string) {
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
      AND i.user_id = ${userId}
      AND COALESCE(i.deleted, false) = false
  `;
  return rows[0] ? mapInvoice(rows[0] as InvoiceRow) : null;
}

async function assertOwnedRefs(
  sql: Sql,
  userId: string,
  consultantId: string,
  clientId: string,
  paymentId: string
) {
  const [consultants, clients, payments] = await Promise.all([
    sql`SELECT id FROM consultants WHERE id = ${consultantId} AND user_id = ${userId}`,
    sql`SELECT id FROM clients WHERE id = ${clientId} AND user_id = ${userId}`,
    sql`SELECT id FROM payment_instructions WHERE id = ${paymentId} AND user_id = ${userId}`,
  ]);

  if (!consultants[0] || !clients[0] || !payments[0]) {
    throw new ApiError('Related entity not found', 400);
  }
}

function computeInvoiceAmounts(
  lineItems: LineItemInput[] | undefined,
  vatRateInput: number | undefined,
  irpfRateInput: number | null | undefined,
  descriptionFallback?: string
): ComputedAmounts {
  if (!lineItems?.length) {
    throw new ApiError('At least one line item is required', 400);
  }

  const normalized = lineItems.map((item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    if (!item.description?.trim()) {
      throw new ApiError('Line item description is required', 400);
    }
    if (quantity <= 0 || rate < 0) {
      throw new ApiError('Invalid line item amounts', 400);
    }
    return {
      description: item.description.trim(),
      quantity,
      rate,
      total: Number((quantity * rate).toFixed(2)),
      includeVat: Boolean(item.includeVat),
    };
  });

  const subtotal = Number(
    normalized.reduce((sum, item) => sum + item.total, 0).toFixed(2)
  );
  const hasVatItems = normalized.some((item) => item.includeVat);
  const vat_rate = hasVatItems ? Number(vatRateInput) || 0 : 0;
  const vatableAmount = normalized
    .filter((item) => item.includeVat)
    .reduce((sum, item) => sum + item.total, 0);
  const vat_amount = Number((vatableAmount * (vat_rate / 100)).toFixed(2));
  const irpf_rate =
    irpfRateInput === undefined || irpfRateInput === null
      ? null
      : Number(irpfRateInput);
  const irpf_amount =
    irpf_rate == null
      ? null
      : Number((subtotal * (irpf_rate / 100)).toFixed(2));
  const total = Number((subtotal + vat_amount).toFixed(2));
  const description =
    descriptionFallback?.trim() ||
    normalized.map((item) => item.description).join(', ');

  return {
    lineItems: normalized,
    subtotal,
    vat_rate,
    vat_amount,
    vat_exempt: !hasVatItems,
    irpf_rate,
    irpf_amount,
    total,
    description,
  };
}

async function insertLineItems(
  sql: Sql,
  invoiceId: string,
  lineItems: ComputedAmounts['lineItems']
) {
  for (let index = 0; index < lineItems.length; index++) {
    const item = lineItems[index];
    await sql`
      INSERT INTO invoice_line_items (
        invoice_id, description, quantity, rate, total, include_vat, order_index
      )
      VALUES (
        ${invoiceId},
        ${item.description},
        ${item.quantity},
        ${item.rate},
        ${item.total},
        ${item.includeVat},
        ${index}
      )
    `;
  }
}

async function allocateNextInvoiceNumber(sql: Sql, userId: string): Promise<string> {
  const rows = await sql`
    SELECT COALESCE(
      MAX(
        CASE
          WHEN number ~ '^[0-9]+$' THEN number::int
          ELSE 0
        END
      ),
      0
    ) + 1 AS next_number
    FROM invoices
    WHERE user_id = ${userId}
  `;
  return String(rows[0]?.next_number ?? 1);
}

function canRetryInvoiceNumber(requestedNumber: string | null): boolean {
  if (!requestedNumber) return true;
  return /^\d+$/.test(requestedNumber);
}

export function registerInvoiceRoutes(app: Hono<AppEnv>, sql: Sql) {
  app.get('/invoices', async (c) => {
    const userId = c.get('userId');
    const invoices = await fetchAllInvoices(sql, userId);
    return c.json(invoices);
  });

  app.get('/invoices/next-number', async (c) => {
    const userId = c.get('userId');
    const number = await allocateNextInvoiceNumber(sql, userId);
    return c.json({ number });
  });

  app.post('/invoices', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json<InvoiceInput>();

    if (!body.consultant?.id || !body.client?.id || !body.payment_instructions?.id) {
      throw new ApiError('Consultant, client and payment method are required', 400);
    }

    await assertOwnedRefs(
      sql,
      userId,
      body.consultant.id,
      body.client.id,
      body.payment_instructions.id
    );

    const amounts = computeInvoiceAmounts(
      body.line_items,
      body.vat_rate,
      body.irpf_rate,
      body.description
    );

    const requestedNumber = body.number?.trim() || null;
    let number = requestedNumber ?? (await allocateNextInvoiceNumber(sql, userId));

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const inserted = await sql`
          INSERT INTO invoices (
            number, created_date, start_date, end_date,
            consultant_id, client_id, payment_instructions_id,
            description, subtotal, vat_rate, vat_amount, total,
            vat_exempt, status, irpf_rate, irpf_amount, user_id
          )
          VALUES (
            ${number},
            ${body.created_date},
            ${body.start_date},
            ${body.end_date},
            ${body.consultant.id},
            ${body.client.id},
            ${body.payment_instructions.id},
            ${amounts.description},
            ${amounts.subtotal},
            ${amounts.vat_rate},
            ${amounts.vat_amount},
            ${amounts.total},
            ${amounts.vat_exempt},
            ${body.status},
            ${amounts.irpf_rate},
            ${amounts.irpf_amount},
            ${userId}
          )
          RETURNING id
        `;

        const invoiceId = inserted[0].id as string;
        await insertLineItems(sql, invoiceId, amounts.lineItems);

        const invoice = await fetchInvoiceById(sql, invoiceId, userId);
        return c.json(invoice, 201);
      } catch (error) {
        if (error instanceof ApiError) throw error;
        if (!isUniqueViolation(error)) throw error;

        if (attempt >= 2 || !canRetryInvoiceNumber(requestedNumber)) {
          throw new ApiError('No se puede repetir numero de factura', 409);
        }

        number = await allocateNextInvoiceNumber(sql, userId);
      }
    }

    throw new ApiError('No se puede repetir numero de factura', 409);
  });

  app.put('/invoices/:id', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = await c.req.json<Partial<InvoiceInput>>();

    const existing = await sql`
      SELECT id, consultant_id, client_id, payment_instructions_id
      FROM invoices
      WHERE id = ${id}
        AND user_id = ${userId}
        AND COALESCE(deleted, false) = false
    `;
    if (!existing[0]) throw new ApiError('Invoice not found', 404);

    const consultantId = body.consultant?.id ?? (existing[0].consultant_id as string);
    const clientId = body.client?.id ?? (existing[0].client_id as string);
    const paymentId =
      body.payment_instructions?.id ??
      (existing[0].payment_instructions_id as string);

    if (body.consultant?.id || body.client?.id || body.payment_instructions?.id) {
      await assertOwnedRefs(sql, userId, consultantId, clientId, paymentId);
    }

    const shouldRecompute = body.line_items !== undefined;
    const amounts = shouldRecompute
      ? computeInvoiceAmounts(
          body.line_items,
          body.vat_rate,
          body.irpf_rate,
          body.description
        )
      : null;

    let rows;
    if (amounts) {
      rows = await sql`
        UPDATE invoices SET
          number = COALESCE(${body.number ?? null}, number),
          created_date = COALESCE(${body.created_date ?? null}, created_date),
          start_date = COALESCE(${body.start_date ?? null}, start_date),
          end_date = COALESCE(${body.end_date ?? null}, end_date),
          consultant_id = ${consultantId},
          client_id = ${clientId},
          payment_instructions_id = ${paymentId},
          description = ${amounts.description},
          subtotal = ${amounts.subtotal},
          vat_rate = ${amounts.vat_rate},
          vat_amount = ${amounts.vat_amount},
          total = ${amounts.total},
          vat_exempt = ${amounts.vat_exempt},
          status = COALESCE(${body.status ?? null}, status),
          irpf_rate = ${amounts.irpf_rate},
          irpf_amount = ${amounts.irpf_amount}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id
      `;
      await sql`DELETE FROM invoice_line_items WHERE invoice_id = ${id}`;
      await insertLineItems(sql, id, amounts.lineItems);
    } else {
      rows = await sql`
        UPDATE invoices SET
          number = COALESCE(${body.number ?? null}, number),
          created_date = COALESCE(${body.created_date ?? null}, created_date),
          start_date = COALESCE(${body.start_date ?? null}, start_date),
          end_date = COALESCE(${body.end_date ?? null}, end_date),
          consultant_id = ${consultantId},
          client_id = ${clientId},
          payment_instructions_id = ${paymentId},
          description = COALESCE(${body.description ?? null}, description),
          status = COALESCE(${body.status ?? null}, status),
          irpf_rate = COALESCE(${body.irpf_rate ?? null}, irpf_rate),
          irpf_amount = COALESCE(${body.irpf_amount ?? null}, irpf_amount)
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id
      `;
    }

    if (!rows[0]) throw new ApiError('Invoice not found', 404);

    const invoice = await fetchInvoiceById(sql, id, userId);
    return c.json(invoice);
  });

  app.patch('/invoices/:id/soft-delete', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const rows = await sql`
      UPDATE invoices
      SET deleted = true
      WHERE id = ${id}
        AND user_id = ${userId}
        AND COALESCE(deleted, false) = false
      RETURNING id
    `;
    if (!rows[0]) throw new ApiError('Invoice not found', 404);
    return c.json({ id: rows[0].id as string, deleted: true });
  });
}
