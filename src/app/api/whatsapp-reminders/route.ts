import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';
import { decryptWhatsAppKey, encryptWhatsAppKey, whatsappServerReady } from '@server/lib/whatsapp-secrets';
import { assertWhapiConnected, getWhatsAppSettings } from '@server/services/whatsapp-reminders';

export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json(await getWhatsAppSettings(getSql(), userId), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await requireUserId();
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || !('phone' in body) || typeof body.phone !== 'string' ||
        !('enabled' in body) || typeof body.enabled !== 'boolean') {
      throw new ApiError('Revisa el número y las preferencias de WhatsApp', 400);
    }
    const phone = body.phone.replace(/[\s()-]/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      throw new ApiError('Introduce tu teléfono con prefijo internacional, por ejemplo +34', 400);
    }
    if (body.enabled && !whatsappServerReady()) {
      throw new ApiError('Falta completar la configuración de WhatsApp en el servidor', 503);
    }
    const rawToken = 'api_token' in body ? body.api_token : '';
    if (typeof rawToken !== 'string' || rawToken.length > 4096 || /[^\x21-\x7E]/.test(rawToken.trim())) {
      throw new ApiError('El token de Whapi no es válido', 400);
    }
    const sql = getSql();
    const existing = await sql`
      SELECT provider, api_key_encrypted FROM whatsapp_reminder_settings WHERE user_id = ${userId}
    `;
    const token = rawToken.trim();
    if (!token && existing[0]?.provider !== 'whapi') {
      throw new ApiError('Introduce el token del canal de Whapi', 400);
    }
    if (body.enabled || token) {
      let plainToken = token;
      if (!plainToken) {
        try {
          plainToken = decryptWhatsAppKey(String(existing[0].api_key_encrypted));
        } catch {
          throw new ApiError('No se pudo leer el token. Vuelve a introducirlo.', 503);
        }
      }
      await assertWhapiConnected(plainToken);
    }
    const encrypted = token ? encryptWhatsAppKey(token) : String(existing[0].api_key_encrypted);
    await sql`
      INSERT INTO whatsapp_reminder_settings (user_id, phone, api_key_encrypted, enabled, provider)
      VALUES (${userId}, ${phone}, ${encrypted}, ${body.enabled}, 'whapi')
      ON CONFLICT (user_id) DO UPDATE SET
        phone = EXCLUDED.phone, api_key_encrypted = EXCLUDED.api_key_encrypted,
        enabled = EXCLUDED.enabled, provider = 'whapi', updated_at = NOW()
    `;
    return NextResponse.json(await getWhatsAppSettings(sql, userId), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
