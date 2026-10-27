import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { apiErrorResponse } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { whatsappServerReady } from '@server/lib/whatsapp-secrets';
import { processWhatsAppReminders } from '@server/services/whatsapp-reminders';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !whatsappServerReady()) {
    return NextResponse.json({ error: 'WhatsApp reminders are not configured' }, { status: 503 });
  }
  const expected = Buffer.from(`Bearer ${secret}`);
  const provided = Buffer.from(request.headers.get('authorization') ?? '');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await processWhatsAppReminders(getSql());
    return NextResponse.json(result, {
      status: result.failed || result.unknown ? 502 : 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
