import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { ApiError } from '@server/lib/errors';
import { listExpenses, saveExpense } from '@server/services/expenses';

export async function GET() {
  try { return NextResponse.json(await listExpenses(await requireUserId())); }
  catch (error) { return apiErrorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    let input: unknown;
    let file: File | null = null;
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const form = await request.formData();
      const entry = form.get('file');
      if (!(entry instanceof File)) throw new ApiError('Falta el PDF original', 400);
      file = entry;
      try { input = JSON.parse(String(form.get('expense'))); }
      catch { throw new ApiError('Datos de gasto no válidos', 400); }
    } else input = await request.json();
    return NextResponse.json(await saveExpense(userId, input, file), { status: 201 });
  } catch (error) { return apiErrorResponse(error); }
}
