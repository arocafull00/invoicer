import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';
import {
  assertOwnedRefs,
  computeInvoiceAmounts,
  fetchInvoiceById,
  insertLineItems,
  type InvoiceInput,
} from '@server/services/invoices';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const body = (await request.json()) as Partial<InvoiceInput>;

    const existing = await sql`
      SELECT id, consultant_id, client_id, payment_instructions_id
      FROM invoices
      WHERE id = ${id}
        AND user_id = ${userId}
        AND COALESCE(deleted, false) = false
    `;
    if (!existing[0]) throw new ApiError('Invoice not found', 404);

    const consultantId =
      body.consultant?.id ?? (existing[0].consultant_id as string);
    const clientId = body.client?.id ?? (existing[0].client_id as string);
    const paymentId =
      body.payment_instructions?.id ??
      (existing[0].payment_instructions_id as string);

    if (
      body.consultant?.id ||
      body.client?.id ||
      body.payment_instructions?.id
    ) {
      await assertOwnedRefs(sql, userId, consultantId, clientId, paymentId);
    }

    const amounts =
      body.line_items !== undefined
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
    return NextResponse.json(invoice);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
