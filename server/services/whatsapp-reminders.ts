import type { Sql } from '../lib/db';
import { decryptWhatsAppKey, whatsappServerReady } from '../lib/whatsapp-secrets';
import { ApiError } from '../lib/errors';

const TIME_ZONE = 'Europe/Madrid';

type SendResult = { status: 'queued' | 'failed' | 'unknown'; error: string | null };

function whapiError(status: number) {
  switch (status) {
    case 401:
    case 404:
      return 'Revisa el token de Whapi y vincula tu WhatsApp al canal mediante el QR.';
    case 402:
      return 'Has alcanzado un límite del canal de Whapi. Revisa su modalidad y las cuotas disponibles.';
    case 403:
      return 'Whapi no permite enviar mensajes a este destinatario.';
    case 429:
      return 'Whapi ha limitado temporalmente las peticiones. Espera antes de reintentarlo.';
    default:
      return 'Whapi rechazó la petición. Revisa el número de destino y la configuración del canal.';
  }
}

export async function assertWhapiConnected(token: string) {
  let response: Response;
  try {
    response = await fetch('https://gate.whapi.cloud/health', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new ApiError('No se pudo comprobar la conexión con Whapi. Inténtalo de nuevo.', 502);
  }
  if (!response.ok) throw new ApiError(whapiError(response.status), 502);
  const payload: unknown = await response.json().catch(() => null);
  const status = payload && typeof payload === 'object' && 'status' in payload ? payload.status : null;
  if (!status || typeof status !== 'object' || !('text' in status)) {
    throw new ApiError('Whapi no devolvió un estado de conexión válido.', 502);
  }
  if (status.text !== 'AUTH') {
    const message = status.text === 'QR' ? 'Escanea el QR del canal en Whapi para vincular tu WhatsApp.' :
      status.text === 'STOP' ? 'El canal de Whapi está desactivado. Revisa su estado en el panel de Whapi.' :
      status.text === 'SYNC_ERROR' ? 'Whapi no pudo sincronizar tu WhatsApp. Vuelve a vincularlo desde su panel.' :
      'El canal de Whapi aún no está conectado. Espera un momento y vuelve a guardar.';
    throw new ApiError(message, 400);
  }
}

export async function sendWhatsApp(phone: string, token: string, message: string): Promise<SendResult> {
  try {
    const response = await fetch('https://gate.whapi.cloud/messages/text', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        to: `${phone.replace(/^\+/, '')}@s.whatsapp.net`,
        body: message,
        no_link_preview: true,
      }),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(12_000),
    });
    const payload: unknown = await response.json().catch(() => null);
    const sent = payload && typeof payload === 'object' && 'sent' in payload ? payload.sent : null;
    if (response.ok && sent === true) {
      return { status: 'queued', error: null };
    }
    if ((response.status >= 400 && response.status < 500) || (response.ok && sent === false)) {
      return { status: 'failed', error: whapiError(response.status) };
    }
    return { status: 'unknown', error: 'Whapi no confirmó el envío. Comprueba tu WhatsApp antes de reintentarlo.' };
  } catch {
    // A timeout can happen after the provider has accepted the message.
    return { status: 'unknown', error: 'No se pudo confirmar el envío. Comprueba tu WhatsApp antes de reintentarlo.' };
  }
}

export async function getWhatsAppSettings(sql: Sql, userId: string) {
  const [settings, deliveries] = await Promise.all([
    sql`
      SELECT phone, enabled, provider, updated_at FROM whatsapp_reminder_settings
      WHERE user_id = ${userId}
    `,
    sql`
      SELECT reminder_date::text, status, queued_at, error
      FROM whatsapp_reminder_deliveries WHERE user_id = ${userId}
      ORDER BY reminder_date DESC LIMIT 1
    `,
  ]);
  return {
    phone: settings[0]?.phone ?? '',
    enabled: settings[0]?.provider === 'whapi' && settings[0]?.enabled === true,
    has_api_token: settings[0]?.provider === 'whapi',
    server_ready: whatsappServerReady(),
    updated_at: settings[0]?.updated_at ?? null,
    last_delivery: deliveries[0] ?? null,
  };
}

type ReminderEvent = {
  title: string;
  client_name: string | null;
  start_at: string;
  end_at: string;
  all_day: boolean;
};

function buildMessages(date: string, events: ReminderEvent[]): string[] {
  const dateLabel = new Intl.DateTimeFormat('es-ES', {
    timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(`${date}T12:00:00Z`));
  const time = new Intl.DateTimeFormat('es-ES', {
    timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const localDate = new Intl.DateTimeFormat('sv-SE', { timeZone: TIME_ZONE });
  const header = `Invoicer · Mañana, ${dateLabel}\nHorarios de Madrid\n`;
  const messages: string[] = [];
  let current = header;
  for (const event of events) {
    const start = new Date(event.start_at);
    const schedule = event.all_day ? 'Todo el día' :
      localDate.format(start) < date ? 'En curso' : time.format(start);
    const title = [event.title, event.client_name].filter(Boolean).join(' · ').replace(/\s+/g, ' ');
    const line = `\n${schedule} · ${title}`;
    // Keep long digests readable and avoid a single oversized WhatsApp message.
    for (const part of line.match(/[\s\S]{1,1200}/gu) ?? []) {
      if (current.length + part.length > 3500) {
        messages.push(current);
        current = header;
      }
      current += part;
    }
  }
  if (current !== header) messages.push(current);
  return messages;
}

export async function processWhatsAppReminders(sql: Sql) {
  // A previous invocation may have stopped after an accepted send. Never retry it blindly.
  await sql`
    UPDATE whatsapp_reminder_deliveries SET
      status = 'unknown', error = 'El envío se interrumpió. Comprueba tu WhatsApp.'
    WHERE status = 'processing' AND attempted_at < NOW() - INTERVAL '10 minutes'
  `;
  const [settings, dates] = await Promise.all([
    sql`SELECT user_id FROM whatsapp_reminder_settings WHERE enabled = true AND provider = 'whapi'`,
    sql`SELECT ((NOW() AT TIME ZONE 'Europe/Madrid')::date + 1)::text AS tomorrow`,
  ]);
  const date = String(dates[0].tomorrow);
  const counts = { queued: 0, failed: 0, unknown: 0, skipped: 0 };
  for (const setting of settings) {
    const userId = String(setting.user_id);
    const events = await sql`
      SELECT a.title, a.start_at, a.end_at, a.all_day, c.name AS client_name
      FROM appointments a
      LEFT JOIN clients c ON c.id = a.client_id AND c.user_id = a.user_id
      WHERE a.user_id = ${userId} AND a.whatsapp_reminder = true
        AND a.start_at < ((${date}::date + 1)::timestamp AT TIME ZONE 'Europe/Madrid')
        AND (
          a.end_at > (${date}::date::timestamp AT TIME ZONE 'Europe/Madrid')
          OR (a.start_at = a.end_at AND a.start_at >= (${date}::date::timestamp AT TIME ZONE 'Europe/Madrid'))
        )
      ORDER BY a.all_day DESC, a.start_at, a.id
    `;
    if (!events.length) {
      counts.skipped++;
      continue;
    }
    const messages = buildMessages(date, events as ReminderEvent[]);
    const claims = await sql`
      INSERT INTO whatsapp_reminder_deliveries (user_id, reminder_date, status, messages, event_count)
      SELECT user_id, ${date}::date, 'processing', ${JSON.stringify(messages)}::jsonb, ${events.length}
      FROM whatsapp_reminder_settings WHERE user_id = ${userId} AND enabled = true AND provider = 'whapi'
      ON CONFLICT (user_id, reminder_date) DO UPDATE SET
        status = 'processing', attempted_at = NOW(), error = NULL,
        messages = EXCLUDED.messages, event_count = EXCLUDED.event_count
      WHERE whatsapp_reminder_deliveries.status = 'failed' AND whatsapp_reminder_deliveries.queued_parts = 0
      RETURNING messages, queued_parts
    `;
    if (!claims[0]) {
      counts.skipped++;
      continue;
    }
    const savedMessages = claims[0].messages as string[];
    let nextPart = Number(claims[0].queued_parts);
    let result: SendResult = { status: 'queued', error: null };
    try {
      while (nextPart < savedMessages.length) {
        // Recheck that reminders are enabled immediately before each outbound message.
        const current = await sql`
          SELECT phone, api_key_encrypted FROM whatsapp_reminder_settings
          WHERE user_id = ${userId} AND enabled = true AND provider = 'whapi'
        `;
        if (!current[0]) {
          result = { status: 'failed', error: 'Los recordatorios se han desactivado.' };
          break;
        }
        let apiKey: string;
        try {
          apiKey = decryptWhatsAppKey(String(current[0].api_key_encrypted));
        } catch {
          result = { status: 'failed', error: 'No se pudo leer el token de Whapi. Vuelve a guardarlo en Configuración.' };
          break;
        }
        result = await sendWhatsApp(String(current[0].phone), apiKey, savedMessages[nextPart]);
        if (result.status !== 'queued') break;
        nextPart++;
        await sql`
          UPDATE whatsapp_reminder_deliveries SET queued_parts = ${nextPart}
          WHERE user_id = ${userId} AND reminder_date = ${date}::date
        `;
      }
    } catch {
      result = { status: 'unknown', error: 'El envío se interrumpió. Comprueba tu WhatsApp.' };
    }
    if (result.status === 'failed' && nextPart > 0) {
      result = { status: 'unknown', error: 'Solo se aceptó parte del resumen. Comprueba tu WhatsApp.' };
    }
    await sql`
      UPDATE whatsapp_reminder_deliveries SET
        status = ${result.status}, error = ${result.error},
        queued_at = CASE WHEN ${result.status} = 'queued' THEN NOW() ELSE NULL END
      WHERE user_id = ${userId} AND reminder_date = ${date}::date
    `;
    counts[result.status]++;
  }
  return counts;
}
