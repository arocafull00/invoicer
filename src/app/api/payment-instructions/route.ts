import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';

type PaymentInstructionBody = {
  account_holder: string;
  iban: string;
  payment_method: string;
  payment_terms: string;
  additional_data: string;
};

export async function GET() {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM payment_instructions
      WHERE user_id = ${userId}
      ORDER BY account_holder ASC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const body = (await request.json()) as PaymentInstructionBody;
    const rows = await sql`
      INSERT INTO payment_instructions (
        account_holder, iban, payment_method, payment_terms, additional_data, user_id
      )
      VALUES (
        ${body.account_holder},
        ${body.iban},
        ${body.payment_method},
        ${body.payment_terms},
        ${body.additional_data},
        ${userId}
      )
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
