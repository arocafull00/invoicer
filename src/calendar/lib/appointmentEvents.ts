import type { CalendarEvent } from "@ilamy/calendar";
import type { Appointment, AppointmentInput } from "@/shared/types";

export interface AppointmentEventData extends Record<string, unknown> {
  title: string;
  clientId: string | null;
}

export function buildEventTitle(title: string, clientName?: string | null) {
  return clientName ? `${title} · ${clientName}` : title;
}

export function appointmentToEvent(appointment: Appointment) {
  const data: AppointmentEventData = {
    title: appointment.title,
    clientId: appointment.client_id ?? null,
  };
  return {
    id: appointment.id,
    title: buildEventTitle(appointment.title, appointment.client?.name),
    start: appointment.start_at,
    end: appointment.end_at,
    allDay: appointment.all_day,
    description: appointment.notes,
    data,
  };
}

export function eventToAppointmentInput(event: CalendarEvent): AppointmentInput {
  const data = event.data as AppointmentEventData | undefined;
  return {
    title: data?.title ?? event.title,
    client_id: data?.clientId ?? null,
    start_at: event.start.toISOString(),
    end_at: event.end.toISOString(),
    all_day: Boolean(event.allDay),
    notes: event.description ?? "",
  };
}
