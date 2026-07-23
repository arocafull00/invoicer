import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';

type ClientBody = {
  name?: string;
  email?: string | null;
  address?: string;
  city?: string;
  country?: string;
  company_number?: string | null;
};

export async function GET() {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM clients
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
    const body = (await request.json()) as ClientBody;
    const rows = await sql`
      INSERT INTO clients (name, email, address, city, country, company_number, user_id)
      VALUES (
        ${body.name ?? ''},
        ${body.email ?? ''},
        ${body.address ?? ''},
        ${body.city ?? ''},
        ${body.country ?? ''},
        ${body.company_number ?? null},
        ${userId}
      )
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
