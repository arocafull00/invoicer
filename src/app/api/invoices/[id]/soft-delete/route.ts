import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const rows = await sql`
      UPDATE invoices
      SET deleted = true
      WHERE id = ${id}
        AND user_id = ${userId}
        AND COALESCE(deleted, false) = false
      RETURNING id
    `;
    if (!rows[0]) throw new ApiError('Invoice not found', 404);
    return NextResponse.json({ id: rows[0].id as string, deleted: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
