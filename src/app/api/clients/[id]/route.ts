import { NextResponse } from 'next/server';
import { apiErrorResponse, noContent, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';

type ClientBody = {
  name?: string;
  email?: string | null;
  address?: string;
  city?: string;
  country?: string;
  company_number?: string | null;
};

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const body = (await request.json()) as ClientBody;
    const rows = await sql`
      UPDATE clients SET
        name = COALESCE(${body.name ?? null}, name),
        email = COALESCE(${body.email ?? null}, email),
        address = COALESCE(${body.address ?? null}, address),
        city = COALESCE(${body.city ?? null}, city),
        country = COALESCE(${body.country ?? null}, country),
        company_number = COALESCE(${body.company_number ?? null}, company_number)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    if (!rows[0]) throw new ApiError('Client not found', 404);
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
      DELETE FROM clients
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    if (!rows[0]) throw new ApiError('Client not found', 404);
    return noContent();
  } catch (error) {
    return apiErrorResponse(error);
  }
}
