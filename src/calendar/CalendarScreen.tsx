"use client";

import { useMemo } from "react";
import "dayjs/locale/es";
import { toast } from "sonner";
import {
  IlamyCalendar,
  defaultTranslations,
  type CalendarEvent,
  type Translations,
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

  const events = useMemo(
    () => (appointments ?? []).map(appointmentToEvent),
    [appointments]
  );

  const handleAdd = (event: CalendarEvent) => {
    createAppointment.mutate(eventToAppointmentInput(event), {
      onSuccess: () => toast.success("Cita creada"),
      onError: () => toast.error("No se pudo crear la cita"),
    });
  };

  const handleUpdate = (event: CalendarEvent) => {
    updateAppointment.mutate(
      { id: String(event.id), appointment: eventToAppointmentInput(event) },
      {
        onSuccess: () => toast.success("Cita actualizada"),
        onError: () => toast.error("No se pudo actualizar la cita"),
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Calendario</h1>
        <p className="text-muted-foreground mt-1">
          Registra tus citas y asígnalas a clientes
        </p>
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
