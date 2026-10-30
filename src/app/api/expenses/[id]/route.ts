import { apiErrorResponse, noContent, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';
import { NextResponse } from 'next/server';
import { saveExpense } from '@server/services/expenses';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    return NextResponse.json(await saveExpense(userId, await request.json(), null, id));
  } catch (error) { return apiErrorResponse(error); }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const rows = await sql`
      DELETE FROM expenses
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    if (!rows[0]) throw new ApiError('Expense not found', 404);
    return noContent();
  } catch (error) {
    return apiErrorResponse(error);
  }
}
