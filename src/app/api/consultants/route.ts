import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
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

export async function GET() {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM consultants
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
    const body = (await request.json()) as ConsultantBody;
    const rows = await sql`
      INSERT INTO consultants (name, email, address, city, country, nif, user_id)
      VALUES (
        ${body.name},
        ${body.email},
        ${body.address},
        ${body.city},
        ${body.country},
        ${body.nif},
        ${userId}
      )
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return apiErrorResponse(new ApiError('Consultant email already exists', 409));
    }
    return apiErrorResponse(error);
  }
}
