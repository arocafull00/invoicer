"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Trash2 } from "lucide-react";
import type { EventFormProps } from "@ilamy/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useInvoiceStore } from "@/shared/lib/stores";
import { ClientSelectItem } from "@/calendar/components/ClientSelectItem";
import {
  buildEventTitle,
  type AppointmentEventData,
} from "@/calendar/lib/appointmentEvents";

const NO_CLIENT = "none";
const DATE_FORMAT = "YYYY-MM-DD";
const DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm";

interface AppointmentFormValues {
  title: string;
  clientId: string;
  allDay: boolean;
  start: string;
  end: string;
  notes: string;
}

function initialValues(
  selectedEvent: EventFormProps["selectedEvent"]
): AppointmentFormValues {
  const data = selectedEvent?.data as AppointmentEventData | undefined;
  const start = selectedEvent?.start ?? dayjs().startOf("hour").add(1, "hour");
  const end = selectedEvent?.end ?? start.add(1, "hour");
  const allDay = Boolean(selectedEvent?.allDay);
  const format = allDay ? DATE_FORMAT : DATE_TIME_FORMAT;
  return {
    title: data?.title ?? selectedEvent?.title ?? "",
    clientId: data?.clientId ?? NO_CLIENT,
    allDay,
    start: start.format(format),
    end: end.format(format),
    notes: selectedEvent?.description ?? "",
  };
}

export function AppointmentFormDialog({
  open,
  selectedEvent,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: EventFormProps) {
  const clients = useInvoiceStore((state) => state.clients);
  const [form, setForm] = useState(() => initialValues(selectedEvent));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEditing = Boolean(selectedEvent?.id);

  const start = form.allDay
    ? dayjs(form.start).startOf("day")
    : dayjs(form.start);
  const end = form.allDay ? dayjs(form.end).endOf("day") : dayjs(form.end);
  const datesValid = start.isValid() && end.isValid() && !end.isBefore(start);
  const canSubmit = Boolean(form.title.trim()) && datesValid;

  const handleAllDayChange = (allDay: boolean) => {
    const format = allDay ? DATE_FORMAT : DATE_TIME_FORMAT;
    setForm({
      ...form,
      allDay,
      start: dayjs(form.start).format(format),
      end: dayjs(form.end).format(format),
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const clientId = form.clientId === NO_CLIENT ? null : form.clientId;
    const clientName = clients.find((client) => client.id === clientId)?.name;
    const title = form.title.trim();
    const data: AppointmentEventData = { title, clientId };
    const event = {
      id: selectedEvent?.id ?? crypto.randomUUID(),
      title: buildEventTitle(title, clientName),
      start,
      end,
      allDay: form.allDay,
      description: form.notes.trim(),
      data,
    };
    if (isEditing) {
      onUpdate?.(event);
    } else {
      onAdd?.(event);
    }
    onClose();
  };

  const handleDelete = () => {
    if (selectedEvent) onDelete?.(selectedEvent);
    setConfirmDelete(false);
    onClose();
  };

  const dateInputType = form.allDay ? "date" : "datetime-local";

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar cita" : "Nueva cita"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-title">Título</Label>
              <Input
                id="appointment-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={form.clientId}
                onValueChange={(clientId) => setForm({ ...form, clientId })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={NO_CLIENT}
                    className="text-popover-foreground"
                  >
                    Sin cliente
                  </SelectItem>
                  {clients.map((client) => (
                    <ClientSelectItem key={client.id} client={client} />
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="appointment-all-day">Todo el día</Label>
              <Switch
                id="appointment-all-day"
                checked={form.allDay}
                onCheckedChange={handleAllDayChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-start">Inicio</Label>
                <Input
                  id="appointment-start"
                  type={dateInputType}
                  value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-end">Fin</Label>
                <Input
                  id="appointment-end"
                  type={dateInputType}
                  value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })}
                />
              </div>
            </div>
            {!datesValid && (
              <p className="text-sm text-destructive">
                La fecha de fin debe ser posterior a la de inicio
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="appointment-notes">Notas</Label>
              <Textarea
                id="appointment-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            {isEditing && (
              <Button
                variant="destructive"
                className="sm:mr-auto"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cita</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
