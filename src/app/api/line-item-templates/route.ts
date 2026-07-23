import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import {
  mapLineItemTemplate,
  type DbLineItemTemplate,
} from '@server/lib/mappers';

type TemplateBody = {
  description: string;
  default_quantity: number;
  default_rate: number;
  category?: string;
};

export async function GET() {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM line_item_templates
      WHERE user_id = ${userId}
      ORDER BY usage_count DESC
    `;
    return NextResponse.json(
      (rows as DbLineItemTemplate[]).map(mapLineItemTemplate)
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const sql = getSql();
    const body = (await request.json()) as TemplateBody;
    const rows = await sql`
      INSERT INTO line_item_templates (
        description, default_quantity, default_rate, category, usage_count, user_id
      )
      VALUES (
        ${body.description},
        ${body.default_quantity},
        ${body.default_rate},
        ${body.category ?? null},
        0,
        ${userId}
      )
      RETURNING *
    `;
    return NextResponse.json(
      mapLineItemTemplate(rows[0] as DbLineItemTemplate),
      { status: 201 }
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
