import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { ApiError } from '@server/lib/errors';
import { getSql, type Sql } from '@server/lib/db';

const MAX_LOGO_BYTES = 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

async function getOrCreateSettings(sql: Sql, userId: string) {
  const existing = await sql`
    SELECT * FROM user_settings
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  if (existing[0]) return existing[0];

  const inserted = await sql`
    INSERT INTO user_settings (default_currency, date_format, pdf_color_palette, user_id)
    VALUES ('eur', 'dd/mm/yyyy', 'violet', ${userId})
    RETURNING *
  `;
  return inserted[0];
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      throw new ApiError('No se ha seleccionado ningún archivo', 400);
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      throw new ApiError('Formato no válido. Usa PNG, JPG o WEBP', 400);
    }

    if (file.size > MAX_LOGO_BYTES) {
      throw new ApiError('El logo no puede superar 1 MB', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const logoUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    const sql = getSql();
    const current = await getOrCreateSettings(sql, userId);
    const rows = await sql`
      UPDATE user_settings SET
        logo_url = ${logoUrl}
      WHERE id = ${current.id} AND user_id = ${userId}
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE() {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const current = await getOrCreateSettings(sql, userId);
    const rows = await sql`
      UPDATE user_settings SET
        logo_url = NULL
      WHERE id = ${current.id} AND user_id = ${userId}
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
