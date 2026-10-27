import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import {
  getAppointmentById,
  mapAppointment,
  validateAppointment,
  type AppointmentBody,
} from '@server/services/appointments';

export async function GET() {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const rows = await sql`
      SELECT
        a.*,
        CASE
          WHEN c.id IS NULL THEN NULL
          ELSE json_build_object('id', c.id, 'name', c.name)
        END AS client
      FROM appointments a
      LEFT JOIN clients c ON c.id = a.client_id
      WHERE a.user_id = ${userId}
      ORDER BY a.start_at ASC
    `;
    return NextResponse.json(
      rows.map((row) => mapAppointment(row as Record<string, unknown>))
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const body = (await request.json()) as AppointmentBody;
    await validateAppointment(sql, userId, body);

    const inserted = await sql`
      INSERT INTO appointments (
        title, client_id, start_at, end_at, all_day, notes, user_id, whatsapp_reminder
      )
      VALUES (
        ${body.title.trim()},
        ${body.client_id ?? null},
        ${body.start_at},
        ${body.end_at},
        ${body.all_day ?? false},
        ${body.notes ?? ''},
        ${userId},
        ${body.whatsapp_reminder ?? true}
      )
      RETURNING id
    `;

    const appointment = await getAppointmentById(
      sql,
      userId,
      inserted[0].id as string
    );
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
