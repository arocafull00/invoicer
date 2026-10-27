"use client";

import { useMemo, useReducer } from "react";
import Link from "next/link";
import "dayjs/locale/es";
import { toast } from "sonner";
import {
  IlamyCalendar,
  defaultTranslations,
  type CalendarEvent,
  type Translations,
  type BusinessHours,
} from "@ilamy/calendar";
import { Spinner } from "@/shared/components/Spinner";
import {
  useAppointments,
  useCreateAppointment,
  useDeleteAppointment,
  useUpdateAppointment,
} from "@/shared/api/hooks";
import { AppointmentFormDialog } from "@/calendar/components/AppointmentFormDialog";
import {
  appointmentToEvent,
  eventToAppointmentInput,
} from "@/calendar/lib/appointmentEvents";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/shared/lib/stores";
import { DEFAULT_WORKING_HOURS, WEEK_DAYS, hasSameAppointmentTime, isWithinWorkingHours, OUTSIDE_WORKING_HOURS_MESSAGE } from "@/shared/lib/workingHours";

const translations: Translations = {
  ...defaultTranslations,
  today: "Hoy",
  create: "Crear",
  new: "Nueva",
  update: "Actualizar",
  delete: "Eliminar",
  cancel: "Cancelar",
  export: "Exportar",
  previous: "Anterior",
  next: "Siguiente",
  event: "Cita",
  events: "Citas",
  newEvent: "Nueva cita",
  title: "Título",
  description: "Notas",
  allDay: "Todo el día",
  startDate: "Fecha de inicio",
  endDate: "Fecha de fin",
  startTime: "Hora de inicio",
  endTime: "Hora de fin",
  createEvent: "Crear cita",
  editEvent: "Editar cita",
  month: "Mes",
  week: "Semana",
  day: "Día",
  year: "Año",
  more: "más",
  time: "Hora",
  date: "Fecha",
};

export default function CalendarScreen() {
  const { data: appointments, isLoading } = useAppointments();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const hours = useSettingsStore((state) => state.settings?.working_hours) ?? DEFAULT_WORKING_HOURS;
  const [, refreshEvents] = useReducer((version: number) => version + 1, 0);

  const events = (appointments ?? []).map(appointmentToEvent);
  const businessHours = useMemo<BusinessHours[] | undefined>(
    () => hours.enabled ? WEEK_DAYS.flatMap(({ value }) => hours.days[value].map((slot) => ({
      daysOfWeek: [value], startTime: slot.start, endTime: slot.end,
    }))) : undefined,
    [hours],
  );
  const closedDays = useMemo(() => {
    const days = WEEK_DAYS.filter(({ value }) => hours.days[value].length === 0).map(({ value }) => value);
    return hours.enabled && days.length < WEEK_DAYS.length ? days : undefined;
  }, [hours]);

  const canSchedule = (event: CalendarEvent, editing = false) => {
    const input = eventToAppointmentInput(event);
    const previous = editing ? appointments?.find((appointment) => appointment.id === String(event.id)) : undefined;
    if (previous && hasSameAppointmentTime(previous, input)) return true;
    if (isWithinWorkingHours(hours, event.start.toDate(), event.end.toDate(), Boolean(event.allDay))) return true;
    toast.error(OUTSIDE_WORKING_HOURS_MESSAGE);
    refreshEvents();
    return false;
  };

  const handleAdd = (event: CalendarEvent) => {
    if (!canSchedule(event)) return;
    createAppointment.mutate(eventToAppointmentInput(event), {
      onSuccess: () => toast.success("Cita creada"),
      onError: (error) => { toast.error(error.message || "No se pudo crear la cita"); refreshEvents(); },
    });
  };

  const handleUpdate = (event: CalendarEvent) => {
    if (!canSchedule(event, true)) return;
    updateAppointment.mutate(
      { id: String(event.id), appointment: eventToAppointmentInput(event) },
      {
        onSuccess: () => toast.success("Cita actualizada"),
        onError: (error) => { toast.error(error.message || "No se pudo actualizar la cita"); refreshEvents(); },
      }
    );
  };

  const handleDelete = (event: CalendarEvent) => {
    deleteAppointment.mutate(String(event.id), {
      onSuccess: () => toast.success("Cita eliminada"),
      onError: () => toast.error("No se pudo eliminar la cita"),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Calendario" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {hours.enabled
            ? `Solo se muestra tu horario de apertura. Zona horaria: ${hours.timeZone}.`
            : "Configura tus días y horas disponibles desde ajustes."}
        </p>
        <Button asChild variant="outline" size="sm"><Link href="/settings">Configurar horarios</Link></Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="h-[calc(100vh-12rem)] min-h-[600px]">
          <IlamyCalendar
            events={events}
            initialView="week"
            firstDayOfWeek="monday"
            locale="es"
            translations={translations}
            timeFormat="24-hour"
            businessHours={businessHours}
            hideNonBusinessHours={Boolean(businessHours?.length)}
            hiddenDays={closedDays}
            timezone={hours.enabled ? hours.timeZone : undefined}
            slotDuration={hours.enabled ? 15 : 60}
            scrollTime={businessHours?.map((slot) => String(slot.startTime)).sort()[0]}
            onEventAdd={handleAdd}
            onEventUpdate={handleUpdate}
            onEventDelete={handleDelete}
            renderEventForm={(props) => (
              <AppointmentFormDialog
                key={`${props.open}-${props.selectedEvent?.id ?? "new"}-${props.selectedEvent?.start.valueOf() ?? ""}`}
                {...props}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}
