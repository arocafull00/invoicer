import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { ApiError } from '@server/lib/errors';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const sql = getSql();
    const rows = await sql`SELECT filename, encode(content, 'base64') AS content FROM expense_documents WHERE expense_id = ${id} AND user_id = ${userId}`;
    if (!rows[0]) throw new ApiError('PDF no encontrado', 404);
    return new Response(Buffer.from(rows[0].content as string, 'base64'), { headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(rows[0].filename as string)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch (error) { return apiErrorResponse(error); }
}
