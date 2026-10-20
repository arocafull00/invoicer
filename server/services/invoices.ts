import type { Sql } from '../lib/db';
import { ApiError } from '../lib/errors';
import { mapInvoice } from '../lib/mappers';

export type LineItemInput = {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  total?: number;
  includeVat?: boolean;
};

export type InvoiceInput = {
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

export type ComputedAmounts = {
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

export async function fetchAllInvoices(sql: Sql, userId: string) {
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

export async function fetchInvoiceById(
  sql: Sql,
  id: string,
  userId: string
) {
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

export async function assertOwnedRefs(
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

export function computeInvoiceAmounts(
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

export async function insertLineItems(
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

export async function allocateNextInvoiceNumber(
  sql: Sql,
  userId: string
): Promise<string> {
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

export function canRetryInvoiceNumber(requestedNumber: string | null) {
  if (!requestedNumber) return true;
  return /^\d+$/.test(requestedNumber);
}
