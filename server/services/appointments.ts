import type { Sql } from '../lib/db';
import { ApiError } from '../lib/errors';

export type AppointmentBody = {
  title: string;
  client_id?: string | null;
  start_at: string;
  end_at: string;
  all_day?: boolean;
  notes?: string;
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
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function validateAppointment(
  sql: Sql,
  userId: string,
  body: AppointmentBody
) {
  if (!body.title?.trim() || !body.start_at || !body.end_at) {
    throw new ApiError('Missing required fields', 400);
  }

  const start = new Date(body.start_at);
  const end = new Date(body.end_at);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ApiError('Invalid dates', 400);
  }
  if (end < start) {
    throw new ApiError('End must be after start', 400);
  }

  if (body.client_id) {
    const clients = await sql`
      SELECT id FROM clients
      WHERE id = ${body.client_id} AND user_id = ${userId}
    `;
    if (!clients[0]) throw new ApiError('Client not found', 404);
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
