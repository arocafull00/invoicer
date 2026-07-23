import { apiErrorResponse, noContent, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const owned = await sql`
      SELECT id FROM line_item_templates
      WHERE id = ${id} AND user_id = ${userId}
      LIMIT 1
    `;
    if (!owned[0]) throw new ApiError('Template not found', 404);
    await sql`SELECT update_template_usage(${id}::uuid)`;
    return noContent();
  } catch (error) {
    return apiErrorResponse(error);
  }
}
