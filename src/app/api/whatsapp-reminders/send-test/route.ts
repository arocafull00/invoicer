import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';
import { decryptWhatsAppKey } from '@server/lib/whatsapp-secrets';
import { sendWhatsApp } from '@server/services/whatsapp-reminders';

export async function POST() {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const rows = await sql`
      UPDATE whatsapp_reminder_settings SET last_test_at = NOW()
      WHERE user_id = ${userId}
        AND provider = 'whapi'
        AND (last_test_at IS NULL OR last_test_at < NOW() - INTERVAL '1 minute')
      RETURNING phone, api_key_encrypted
    `;
    if (!rows[0]) {
      throw new ApiError('Guarda tu número y token de Whapi. Si acabas de probar, espera un minuto.', 429);
    }
    let apiKey: string;
    try {
      apiKey = decryptWhatsAppKey(String(rows[0].api_key_encrypted));
    } catch {
      throw new ApiError('No se pudo leer el token. Vuelve a guardarlo en Configuración.', 503);
    }
    const result = await sendWhatsApp(
      String(rows[0].phone), apiKey,
      'Invoicer · Prueba de recordatorios por WhatsApp. Recibirás los eventos de mañana en el resumen diario cuando actives los recordatorios.',
    );
    if (result.status !== 'queued') throw new ApiError(result.error ?? 'No se confirmó el envío', 502);
    return NextResponse.json({ status: 'queued' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
