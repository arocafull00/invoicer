import { z } from 'zod';

export const WEEK_DAYS = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
] as const;

const daySchema = z.enum([
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]);
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Introduce una hora válida');
const slotSchema = z.object({
  start: timeSchema,
  end: z.union([timeSchema, z.literal('24:00')]),
}).refine((slot) => slot.start < slot.end, {
  message: 'La hora de fin debe ser posterior a la de inicio',
  path: ['end'],
});

export const workingHoursSchema = z.object({
  enabled: z.boolean(),
  timeZone: z.string().max(100).refine((value) => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, 'Selecciona una zona horaria válida'),
  days: z.record(daySchema, z.array(slotSchema).max(8, 'Máximo 8 tramos por día')),
}).superRefine(({ days }, ctx) => {
  for (const { value, label } of WEEK_DAYS) {
    const slots = [...days[value]].sort((a, b) => a.start.localeCompare(b.start));
    for (let index = 1; index < slots.length; index++) {
      if (slots[index].start < slots[index - 1].end) {
        ctx.addIssue({
          code: 'custom',
          message: `${label}: los tramos no pueden solaparse`,
          path: ['days', value],
        });
      }
    }
  }
});

export type WorkingHours = z.infer<typeof workingHoursSchema>;
export type WorkingDay = keyof WorkingHours['days'];
export type WorkingSlot = WorkingHours['days'][WorkingDay][number];

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  enabled: false,
  timeZone: 'Europe/Madrid',
  days: {
    monday: [{ start: '09:00', end: '18:00' }],
    tuesday: [{ start: '09:00', end: '18:00' }],
    wednesday: [{ start: '09:00', end: '18:00' }],
    thursday: [{ start: '09:00', end: '18:00' }],
    friday: [{ start: '09:00', end: '18:00' }],
    saturday: [],
    sunday: [],
  },
};

export function getWorkingHours(value: unknown): WorkingHours {
  const result = workingHoursSchema.safeParse(value);
  return result.success ? result.data : DEFAULT_WORKING_HOURS;
}

export function isWithinWorkingHours(
  hours: WorkingHours,
  start: Date,
  end: Date,
  allDay = false,
): boolean {
  if (!hours.enabled || allDay) return true;
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) return false;

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: hours.timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  const parts = (date: Date) => Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  const from = parts(start);
  // The end is exclusive: a slot ending at midnight belongs to the previous day.
  const until = parts(new Date(end.getTime() - 1));
  if (from.year !== until.year || from.month !== until.month || from.day !== until.day) return false;
  const startSeconds = Number(from.hour) * 3600 + Number(from.minute) * 60 + Number(from.second);
  const endSeconds = Number(until.hour) * 3600 + Number(until.minute) * 60 + Number(until.second);
  return hours.days[from.weekday.toLowerCase() as WorkingDay].some((slot) => {
    const [startHour, startMinute] = slot.start.split(':').map(Number);
    const [endHour, endMinute] = slot.end.split(':').map(Number);
    return startSeconds >= startHour * 3600 + startMinute * 60 &&
      endSeconds < endHour * 3600 + endMinute * 60;
  });
}

export const OUTSIDE_WORKING_HOURS_MESSAGE =
  'La cita debe quedar dentro de un tramo de tu horario. Puedes cambiarlo en Ajustes → Horarios.';

export function hasSameAppointmentTime(
  previous: { start_at: string; end_at: string; all_day: boolean },
  next: { start_at: string; end_at: string; all_day?: boolean },
): boolean {
  return new Date(previous.start_at).getTime() === new Date(next.start_at).getTime() &&
    new Date(previous.end_at).getTime() === new Date(next.end_at).getTime() &&
    previous.all_day === Boolean(next.all_day);
}
