import { NextResponse } from 'next/server';
import { apiErrorResponse, noContent, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';
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

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const body = (await request.json()) as Partial<TemplateBody>;
    const rows = await sql`
      UPDATE line_item_templates SET
        description = COALESCE(${body.description ?? null}, description),
        default_quantity = COALESCE(${body.default_quantity ?? null}, default_quantity),
        default_rate = COALESCE(${body.default_rate ?? null}, default_rate),
        category = COALESCE(${body.category ?? null}, category)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    if (!rows[0]) throw new ApiError('Template not found', 404);
    return NextResponse.json(
      mapLineItemTemplate(rows[0] as DbLineItemTemplate)
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const rows = await sql`
      DELETE FROM line_item_templates
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    if (!rows[0]) throw new ApiError('Template not found', 404);
    return noContent();
  } catch (error) {
    return apiErrorResponse(error);
  }
}
