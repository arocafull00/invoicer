import { NextResponse } from 'next/server';
import { apiErrorResponse, noContent, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';
import {
  getAppointmentById,
  validateAppointment,
  type AppointmentBody,
} from '@server/services/appointments';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const body = (await request.json()) as AppointmentBody;
    await validateAppointment(sql, userId, body);

    const rows = await sql`
      UPDATE appointments SET
        title = ${body.title.trim()},
        client_id = ${body.client_id ?? null},
        start_at = ${body.start_at},
        end_at = ${body.end_at},
        all_day = ${body.all_day ?? false},
        notes = ${body.notes ?? ''}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    if (!rows[0]) throw new ApiError('Appointment not found', 404);

    return NextResponse.json(await getAppointmentById(sql, userId, id));
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
      DELETE FROM appointments
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    if (!rows[0]) throw new ApiError('Appointment not found', 404);
    return noContent();
  } catch (error) {
    return apiErrorResponse(error);
  }
}
