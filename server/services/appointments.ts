import type { Sql } from '../lib/db';
import { ApiError } from '../lib/errors';
import {
  getWorkingHours,
  hasSameAppointmentTime,
  isWithinWorkingHours,
  OUTSIDE_WORKING_HOURS_MESSAGE,
} from '@/shared/lib/workingHours';

export type AppointmentBody = {
  title: string;
  client_id?: string | null;
  start_at: string;
  end_at: string;
  all_day?: boolean;
  notes?: string;
  whatsapp_reminder?: boolean;
};

export function mapAppointment(row: Record<string, unknown>) {
  const client = row.client as Record<string, unknown> | null;
  return {
    id: row.id,
    title: row.title,
    client_id: row.client_id,
    client: client ? { id: client.id, name: client.name } : null,
    start_at: row.start_at,
    end_at: row.end_at,
    all_day: row.all_day,
    notes: row.notes,
    whatsapp_reminder: row.whatsapp_reminder,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function validateAppointment(
  sql: Sql,
  userId: string,
  body: AppointmentBody,
  appointmentId?: string,
) {
  if (body.all_day !== undefined && typeof body.all_day !== 'boolean') {
    throw new ApiError('Invalid all_day value', 400);
  }
  if (body.whatsapp_reminder !== undefined && typeof body.whatsapp_reminder !== 'boolean') {
    throw new ApiError('Invalid WhatsApp reminder preference', 400);
  }
  if (!body.title?.trim() || !body.start_at || !body.end_at) {
    throw new ApiError('Missing required fields', 400);
  }

  const start = new Date(body.start_at);
  const end = new Date(body.end_at);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ApiError('Invalid dates', 400);
  }
  if (end < start || (!body.all_day && end.getTime() === start.getTime())) {
    throw new ApiError('End must be after start', 400);
  }

  const [clients, settings, previous] = await Promise.all([
    body.client_id ? sql`
      SELECT id FROM clients
      WHERE id = ${body.client_id} AND user_id = ${userId}
    ` : Promise.resolve(null),
    body.all_day ? Promise.resolve([]) : sql`
      SELECT working_hours FROM user_settings WHERE user_id = ${userId} LIMIT 1
    `,
    appointmentId ? sql`
      SELECT start_at, end_at, all_day FROM appointments
      WHERE id = ${appointmentId} AND user_id = ${userId}
    ` : Promise.resolve([]),
  ]);
  if (clients && !clients[0]) throw new ApiError('Client not found', 404);
  if (appointmentId && !previous[0]) throw new ApiError('Appointment not found', 404);

  const unchangedTime = previous[0] && hasSameAppointmentTime({
    start_at: String(previous[0].start_at),
    end_at: String(previous[0].end_at),
    all_day: Boolean(previous[0].all_day),
  }, body);
  if (!unchangedTime && !isWithinWorkingHours(getWorkingHours(settings[0]?.working_hours), start, end, body.all_day)) {
    throw new ApiError(OUTSIDE_WORKING_HOURS_MESSAGE, 400);
  }
}

export async function getAppointmentById(
  sql: Sql,
  userId: string,
  id: string
) {
  const rows = await sql`
    SELECT
      a.*,
      CASE
        WHEN c.id IS NULL THEN NULL
        ELSE json_build_object('id', c.id, 'name', c.name)
      END AS client
    FROM appointments a
    LEFT JOIN clients c ON c.id = a.client_id
    WHERE a.id = ${id} AND a.user_id = ${userId}
  `;
  if (!rows[0]) throw new ApiError('Appointment not found', 404);
  return mapAppointment(rows[0] as Record<string, unknown>);
}
