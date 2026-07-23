import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError, isUniqueViolation } from '@server/lib/errors';
import {
  allocateNextInvoiceNumber,
  assertOwnedRefs,
  canRetryInvoiceNumber,
  computeInvoiceAmounts,
  fetchAllInvoices,
  fetchInvoiceById,
  insertLineItems,
  type InvoiceInput,
} from '@server/services/invoices';

export async function GET() {
  try {
    const userId = await requireUserId();
    const invoices = await fetchAllInvoices(getSql(), userId);
    return NextResponse.json(invoices);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const body = (await request.json()) as InvoiceInput;

    if (
      !body.consultant?.id ||
      !body.client?.id ||
      !body.payment_instructions?.id
    ) {
      throw new ApiError(
        'Consultant, client and payment method are required',
        400
      );
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
    let number =
      requestedNumber ?? (await allocateNextInvoiceNumber(sql, userId));

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
        return NextResponse.json(invoice, { status: 201 });
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
  } catch (error) {
    return apiErrorResponse(error);
  }
}
