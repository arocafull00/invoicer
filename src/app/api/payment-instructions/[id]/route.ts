import { NextResponse } from 'next/server';
import { apiErrorResponse, noContent, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';

type PaymentInstructionBody = {
  account_holder: string;
  iban: string;
  payment_method: string;
  payment_terms: string;
  additional_data: string;
};

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const body = (await request.json()) as Partial<PaymentInstructionBody>;
    const rows = await sql`
      UPDATE payment_instructions SET
        account_holder = COALESCE(${body.account_holder ?? null}, account_holder),
        iban = COALESCE(${body.iban ?? null}, iban),
        payment_method = COALESCE(${body.payment_method ?? null}, payment_method),
        payment_terms = COALESCE(${body.payment_terms ?? null}, payment_terms),
        additional_data = COALESCE(${body.additional_data ?? null}, additional_data)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    if (!rows[0]) throw new ApiError('Payment instruction not found', 404);
    return NextResponse.json(rows[0]);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const rows = await sql`
      DELETE FROM payment_instructions
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    if (!rows[0]) throw new ApiError('Payment instruction not found', 404);
    return noContent();
  } catch (error) {
    return apiErrorResponse(error);
  }
}
