'use client';

import { useState, type FormEvent } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { SettingsField } from '@/settings/components/SettingsField';
import { apiClient } from '@/shared/api/client';
import type { WhatsAppReminderSettings } from '@/shared/types';

export function WhatsAppRemindersCard() {
  const { user } = useUser();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['whatsapp-reminders', user?.id],
    queryFn: () => apiClient.getWhatsAppReminderSettings(),
    enabled: Boolean(user),
  });

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader>
        <CardTitle>Recordatorios por WhatsApp</CardTitle>
        <CardDescription>
          Un resumen con tus eventos de mañana, enviado a tu propio teléfono.
        </CardDescription>
      </CardHeader>
      {isPending ? (
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      ) : isError ? (
        <CardContent className="flex flex-col items-start gap-3">
          <p role="alert" className="text-sm text-destructive">No se pudo cargar la configuración de WhatsApp.</p>
          <Button variant="outline" onClick={() => void refetch()}>Reintentar</Button>
        </CardContent>
      ) : data && user ? (
        <WhatsAppReminderForm key={`${user.id}-${data.updated_at}`} settings={data} userId={user.id} />
      ) : null}
    </Card>
  );
}

function WhatsAppReminderForm({ settings, userId }: { settings: WhatsAppReminderSettings; userId: string }) {
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState(settings.phone);
  const [apiToken, setApiToken] = useState('');
  const [enabled, setEnabled] = useState(settings.enabled);
  const dirty = phone !== settings.phone || enabled !== settings.enabled || Boolean(apiToken);
  const save = useMutation({
    mutationFn: () => apiClient.updateWhatsAppReminderSettings({ phone, api_token: apiToken, enabled }),
    onSuccess: (data) => {
      setApiToken('');
      queryClient.setQueryData(['whatsapp-reminders', userId], data);
      toast.success('Preferencias de WhatsApp guardadas');
    },
    onError: (error) => toast.error(error.message),
  });
  const test = useMutation({
    mutationFn: () => apiClient.sendWhatsAppReminderTest(),
    onSuccess: () => toast.success('Whapi ha aceptado la prueba. Comprueba el mensaje y la notificación en tu WhatsApp.'),
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <CardContent className="flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          Cada tarde, entre las 19:00 y las 20:00 en invierno; entre las 20:00 y las 21:00 en verano
          (hora de Madrid). Si no tienes eventos para mañana, no recibirás mensaje.
        </p>
        <p className="text-sm text-muted-foreground">
          Vincula tu WhatsApp mediante el QR en el{' '}
          <a href="https://panel.whapi.cloud/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
            panel de Whapi
          </a>{' '}
          y copia el token del canal. Su modalidad Sandbox tiene límites gratuitos.
        </p>
        <SettingsField id="whatsapp-phone" label="Tu teléfono" description="El número en el que quieres recibir tus recordatorios, con prefijo internacional">
          <Input
            id="whatsapp-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+34…"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            maxLength={30}
            disabled={save.isPending}
          />
        </SettingsField>
        <SettingsField
          id="whatsapp-api-token"
          label="Token de Whapi"
          description={settings.has_api_token ? 'Ya hay un token guardado. Déjalo vacío para conservarlo.' : 'Copia el token del canal desde el panel de Whapi. Se guarda cifrado.'}
        >
          <Input
            id="whatsapp-api-token"
            type="password"
            autoComplete="new-password"
            value={apiToken}
            onChange={(event) => setApiToken(event.target.value)}
            required={!settings.has_api_token}
            maxLength={4096}
            disabled={save.isPending}
          />
        </SettingsField>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="whatsapp-enabled">Activar resumen diario</Label>
            <p id="whatsapp-enabled-description" className="text-xs text-muted-foreground">
              Puedes excluir eventos al crearlos o editarlos en el calendario.
            </p>
          </div>
          <Switch
            id="whatsapp-enabled"
            aria-describedby="whatsapp-enabled-description"
            checked={enabled}
            onCheckedChange={setEnabled}
            disabled={save.isPending || test.isPending}
          />
        </div>
        {!settings.server_ready ? (
          <p role="status" className="text-sm text-muted-foreground">
            Falta completar la configuración en el servidor para poder guardar el token y activar los avisos.
          </p>
        ) : null}
        {settings.last_delivery ? (
          <p role="status" className="text-sm text-muted-foreground">
            Último resumen ({new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid' }).format(new Date(`${settings.last_delivery.reminder_date}T12:00:00Z`))}):{' '}
            {settings.last_delivery.status === 'queued' ? 'aceptado por el proveedor.' :
              settings.last_delivery.status === 'processing' ? 'en proceso.' : settings.last_delivery.error}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Los títulos, horarios y nombres de cliente de los eventos incluidos se enviarán a Whapi para entregarte el resumen.
          Si el canal usa este mismo número, comprueba con «Enviar prueba» que recibes el mensaje y el aviso en el móvil.
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 px-0">
        <Button type="submit" disabled={!dirty || save.isPending || test.isPending || !settings.server_ready}>
          {save.isPending ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!settings.has_api_token || !settings.server_ready || dirty || save.isPending || test.isPending}
          onClick={() => test.mutate()}
        >
          {test.isPending ? 'Enviando…' : 'Enviar prueba'}
        </Button>
      </CardFooter>
    </form>
  );
}
