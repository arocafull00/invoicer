import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';

type ExpenseBody = {
  date: string;
  invoice_number?: string;
  provider: string;
  concept: string;
  base_amount: number;
  vat_amount?: number;
  total: number;
  expense_type_id?: string | null;
};

function mapExpense(row: Record<string, unknown>) {
  const expenseType = row.expense_type as Record<string, unknown> | null;
  return {
    id: row.id,
    date: row.date,
    invoice_number: row.invoice_number,
    provider: row.provider,
    concept: row.concept,
    base_amount: Number(row.base_amount),
    vat_amount: Number(row.vat_amount),
    total: Number(row.total),
    expense_type_id: row.expense_type_id,
    expense_type: expenseType
      ? { id: expenseType.id, name: expenseType.name }
      : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET() {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const rows = await sql`
      SELECT
        e.*,
        CASE
          WHEN et.id IS NULL THEN NULL
          ELSE json_build_object('id', et.id, 'name', et.name)
        END AS expense_type
      FROM expenses e
      LEFT JOIN expense_types et ON et.id = e.expense_type_id
      WHERE e.user_id = ${userId}
      ORDER BY e.date DESC, e.created_at DESC
    `;
    return NextResponse.json(
      rows.map((row) => mapExpense(row as Record<string, unknown>))
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const body = (await request.json()) as ExpenseBody;

    if (!body.date || !body.provider?.trim() || !body.concept?.trim()) {
      throw new ApiError('Missing required fields', 400);
    }
    if (body.total == null || Number(body.total) <= 0) {
      throw new ApiError('Total must be greater than 0', 400);
    }

    const inserted = await sql`
      INSERT INTO expenses (
        date, invoice_number, provider, concept,
        base_amount, vat_amount, total, expense_type_id, user_id
      )
      VALUES (
        ${body.date},
        ${body.invoice_number ?? ''},
        ${body.provider.trim()},
        ${body.concept.trim()},
        ${body.base_amount ?? 0},
        ${body.vat_amount ?? 0},
        ${body.total},
        ${body.expense_type_id ?? null},
        ${userId}
      )
      RETURNING id
    `;

    const id = inserted[0].id as string;
    const rows = await sql`
      SELECT
        e.*,
        CASE
          WHEN et.id IS NULL THEN NULL
          ELSE json_build_object('id', et.id, 'name', et.name)
        END AS expense_type
      FROM expenses e
      LEFT JOIN expense_types et ON et.id = e.expense_type_id
      WHERE e.id = ${id} AND e.user_id = ${userId}
    `;

    return NextResponse.json(
      mapExpense(rows[0] as Record<string, unknown>),
      { status: 201 }
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
