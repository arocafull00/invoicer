'use client';

import { useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/shared/lib/stores';
import {
  DEFAULT_WORKING_HOURS,
  WEEK_DAYS,
  workingHoursSchema,
  type WorkingDay,
  type WorkingHours,
  type WorkingSlot,
} from '@/shared/lib/workingHours';

function WorkingHoursEditor({ initial }: { initial: WorkingHours }) {
  const update = useSettingsStore((state) => state.update);
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const validation = workingHoursSchema.safeParse(draft);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const setSlots = (day: WorkingDay, slots: WorkingSlot[]) => {
    setDraft((current) => ({ ...current, days: { ...current.days, [day]: slots } }));
  };

  const save = async () => {
    if (!validation.success || saving || !dirty) return;
    setSaving(true);
    try {
      await update({ working_hours: validation.data });
      toast.success('Horario guardado. Ya se aplica al calendario');
    } catch {
      // The settings store reports the error; keep the draft available to retry.
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <fieldset disabled={saving} className="min-w-0">
        <legend className="sr-only">Disponibilidad semanal</legend>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="working-hours-enabled">Aplicar horarios al calendario</Label>
              <p id="working-hours-help" className="text-sm text-muted-foreground">
                Solo podrás crear o mover citas con hora dentro de tus tramos disponibles.
                Las citas de todo el día no tienen esta restricción.
              </p>
            </div>
            <Switch
              id="working-hours-enabled"
              checked={draft.enabled}
              aria-describedby="working-hours-help"
              onCheckedChange={(enabled) => setDraft((current) => ({ ...current, enabled }))}
            />
          </div>

          <div className="flex max-w-sm flex-col gap-2">
            <Label htmlFor="working-hours-timezone">Zona horaria</Label>
            <Input
              id="working-hours-timezone"
              list="working-hours-timezones"
              value={draft.timeZone}
              aria-describedby="working-hours-timezone-help"
              aria-invalid={validation.error?.issues.some((issue) => issue.path[0] === 'timeZone') || undefined}
              onChange={(event) => setDraft((current) => ({ ...current, timeZone: event.target.value }))}
            />
            <datalist id="working-hours-timezones">
              {['Europe/Madrid', 'Atlantic/Canary', 'Europe/London', 'America/Mexico_City', 'America/Bogota', 'America/Argentina/Buenos_Aires', 'America/Santiago', 'UTC'].map((zone) => (
                <option key={zone} value={zone} />
              ))}
            </datalist>
            <p id="working-hours-timezone-help" className="text-sm text-muted-foreground">
              El calendario y las citas usarán esta zona. Ejemplo: Europe/Madrid.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-border">
            {WEEK_DAYS.map(({ value: day, label }) => {
              const slots = draft.days[day];
              const dayErrors = validation.error?.issues.filter((issue) => issue.path[1] === day) ?? [];
              return (
                <fieldset key={day} className="flex min-w-0 flex-col gap-3 py-4 first:pt-0">
                  <legend className="sr-only">{label}</legend>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex w-32 shrink-0 items-center gap-3 pt-1.5">
                      <Switch
                        id={`working-${day}`}
                        checked={slots.length > 0}
                        onCheckedChange={(checked) => setSlots(day, checked ? [{ start: '09:00', end: '18:00' }] : [])}
                      />
                      <Label htmlFor={`working-${day}`}>{label}</Label>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      {slots.length === 0 ? (
                        <p className="py-1.5 text-sm text-muted-foreground">No disponible</p>
                      ) : slots.map((slot, index) => (
                        <div key={index} className="flex flex-wrap items-end gap-2">
                          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-none">
                            <Label htmlFor={`${day}-start-${index}`} className="sr-only">{label}: inicio del tramo {index + 1}</Label>
                            <Input
                              id={`${day}-start-${index}`}
                              type="time"
                              step={900}
                              required
                              className="sm:w-32"
                              value={slot.start}
                              aria-invalid={dayErrors.length > 0 || undefined}
                              aria-describedby={dayErrors.length ? `${day}-errors` : undefined}
                              onChange={(event) => setSlots(day, slots.map((item, i) => i === index ? { ...item, start: event.target.value } : item))}
                            />
                          </div>
                          <span className="pb-2 text-sm text-muted-foreground">a</span>
                          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-none">
                            <Label htmlFor={`${day}-end-${index}`} className="sr-only">{label}: fin del tramo {index + 1}</Label>
                            <Input
                              id={`${day}-end-${index}`}
                              type="time"
                              step={900}
                              required
                              className="sm:w-32"
                              value={slot.end === '24:00' ? '00:00' : slot.end}
                              aria-invalid={dayErrors.length > 0 || undefined}
                              aria-describedby={dayErrors.length ? `${day}-errors` : undefined}
                              onChange={(event) => setSlots(day, slots.map((item, i) => i === index ? { ...item, end: event.target.value === '00:00' ? '24:00' : event.target.value } : item))}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Eliminar tramo ${index + 1} del ${label.toLowerCase()}`}
                            onClick={() => setSlots(day, slots.filter((_, i) => i !== index))}
                          >
                            <Trash2 aria-hidden />
                          </Button>
                        </div>
                      ))}
                      {slots.length > 0 && slots.length < 8 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="self-start"
                          onClick={() => {
                            const lastEnd = slots.reduce((latest, slot) => slot.end > latest ? slot.end : latest, '00:00');
                            setSlots(day, [...slots, { start: lastEnd < '23:00' ? lastEnd : '09:00', end: lastEnd < '18:00' ? '18:00' : '23:00' }]);
                          }}
                        >
                          <Plus data-icon="inline-start" aria-hidden />
                          Añadir tramo
                          <span className="sr-only">al {label.toLowerCase()}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  {dayErrors.length > 0 && (
                    <p id={`${day}-errors`} role="alert" className="text-sm text-destructive">
                      {[...new Set(dayErrors.map((issue) => issue.message))].join('. ')}
                    </p>
                  )}
                </fieldset>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            Añade varios tramos para dejar descansos. Las 00:00 como hora de fin indican
            medianoche. Las citas existentes seguirán visibles aunque queden fuera del horario.
          </p>
          {validation.error?.issues.some((issue) => issue.path[0] === 'timeZone') && (
            <p role="alert" className="text-sm text-destructive">Selecciona una zona horaria válida.</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-3 border-t pt-5">
          {dirty && <p className="mr-auto text-sm text-muted-foreground" role="status">Cambios sin guardar</p>}
          <Button type="button" variant="outline" disabled={!dirty || saving} onClick={() => setDraft(initial)}>
            Descartar
          </Button>
          <Button type="submit" disabled={!dirty || saving || !validation.success}>
            {saving && <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />}
            {saving ? 'Guardando…' : 'Guardar horarios'}
          </Button>
        </CardFooter>
      </fieldset>
    </form>
  );
}

export function WorkingHoursSettingsCard() {
  const settings = useSettingsStore((state) => state.settings);
  const hours = settings?.working_hours ?? DEFAULT_WORKING_HOURS;
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Horarios</CardTitle>
        <CardDescription>Configura tu disponibilidad semanal y los descansos entre citas.</CardDescription>
      </CardHeader>
      {settings ? (
        <WorkingHoursEditor key={JSON.stringify(hours)} initial={hours} />
      ) : (
        <CardContent><Skeleton className="h-64 w-full" /></CardContent>
      )}
    </Card>
  );
}
