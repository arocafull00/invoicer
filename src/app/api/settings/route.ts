import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql, type Sql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';

type SettingsBody = {
  default_currency?: 'eur' | 'usd' | 'gbp';
  date_format?: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  pdf_color_palette?: 'violet' | 'blue' | 'emerald' | 'rose';
  irpf_rate?: number | null;
};

function parseIrpfRate(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new ApiError('IRPF rate must be between 0 and 100', 400);
  }
  return Number(parsed.toFixed(2));
}

async function getOrCreateSettings(sql: Sql, userId: string) {
  const existing = await sql`
    SELECT * FROM user_settings
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  if (existing[0]) return existing[0];

  const inserted = await sql`
    INSERT INTO user_settings (default_currency, date_format, pdf_color_palette, irpf_rate, user_id)
    VALUES ('eur', 'dd/mm/yyyy', 'violet', 20, ${userId})
    RETURNING *
  `;
  return inserted[0];
}

export async function GET() {
  try {
    const userId = await requireUserId();
    const settings = await getOrCreateSettings(getSql(), userId);
    return NextResponse.json(settings);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const body = (await request.json()) as SettingsBody;
    const irpfRate = parseIrpfRate(body.irpf_rate);
    const current = await getOrCreateSettings(sql, userId);
    const rows = await sql`
      UPDATE user_settings SET
        default_currency = COALESCE(${body.default_currency ?? null}, default_currency),
        date_format = COALESCE(${body.date_format ?? null}, date_format),
        pdf_color_palette = COALESCE(${body.pdf_color_palette ?? null}, pdf_color_palette),
        irpf_rate = COALESCE(${irpfRate}, irpf_rate)
      WHERE id = ${current.id} AND user_id = ${userId}
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
