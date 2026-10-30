import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { ApiError } from '@server/lib/errors';
import { getSql } from '@server/lib/db';
import { defaultTaxSettings, taxPeriodSchema } from '@/expenses/lib/taxSettings';

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    const url = new URL(request.url);
    const settings = defaultTaxSettings(Number(url.searchParams.get('year')), Number(url.searchParams.get('quarter')));
    if (!taxPeriodSchema.safeParse(settings).success) throw new ApiError('Período no válido', 400);
    const sql = getSql();
    const rows = await sql`SELECT * FROM tax_period_settings WHERE user_id = ${userId} AND year = ${settings.year} AND quarter = ${settings.quarter}`;
    if (rows[0]) Object.assign(settings, { model130_required: rows[0].model130_required, prior_irpf_payments: Number(rows[0].prior_irpf_payments), vat_credit: Number(rows[0].vat_credit) });
    return NextResponse.json(settings);
  } catch (error) { return apiErrorResponse(error); }
}

export async function PUT(request: Request) {
  try {
    const userId = await requireUserId();
    const result = taxPeriodSchema.safeParse(await request.json());
    if (!result.success) throw new ApiError('Revisa el período y los importes, que no pueden ser negativos', 400);
    const s = result.data;
    const sql = getSql();
    await sql`INSERT INTO tax_period_settings (user_id, year, quarter, model130_required, prior_irpf_payments, vat_credit)
      VALUES (${userId}, ${s.year}, ${s.quarter}, ${s.model130_required}, ${s.prior_irpf_payments}, ${s.vat_credit})
      ON CONFLICT (user_id, year, quarter) DO UPDATE SET model130_required = EXCLUDED.model130_required,
        prior_irpf_payments = EXCLUDED.prior_irpf_payments, vat_credit = EXCLUDED.vat_credit`;
    return NextResponse.json(s);
  } catch (error) { return apiErrorResponse(error); }
}
