import { NextResponse } from 'next/server';
import { apiErrorResponse, noContent, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError, isUniqueViolation } from '@server/lib/errors';

type ConsultantBody = {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  nif: string;
};

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const body = (await request.json()) as Partial<ConsultantBody>;
    const rows = await sql`
      UPDATE consultants SET
        name = COALESCE(${body.name ?? null}, name),
        email = COALESCE(${body.email ?? null}, email),
        address = COALESCE(${body.address ?? null}, address),
        city = COALESCE(${body.city ?? null}, city),
        country = COALESCE(${body.country ?? null}, country),
        nif = COALESCE(${body.nif ?? null}, nif)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    if (!rows[0]) throw new ApiError('Consultant not found', 404);
    return NextResponse.json(rows[0]);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return apiErrorResponse(new ApiError('Consultant email already exists', 409));
    }
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const rows = await sql`
      DELETE FROM consultants
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    if (!rows[0]) throw new ApiError('Consultant not found', 404);
    return noContent();
  } catch (error) {
    return apiErrorResponse(error);
  }
}
