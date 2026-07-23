import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError, isUniqueViolation } from '@server/lib/errors';

export async function GET() {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM expense_types
      WHERE user_id = ${userId}
      ORDER BY name ASC
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
    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim();
    if (!name) throw new ApiError('Name is required', 400);

    const rows = await sql`
      INSERT INTO expense_types (name, user_id)
      VALUES (${name}, ${userId})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return apiErrorResponse(
        new ApiError('Ya existe un tipo de gasto con ese nombre', 409)
      );
    }
    return apiErrorResponse(error);
  }
}
