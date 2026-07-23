import { NextResponse } from 'next/server';
import { apiErrorResponse, requireUserId } from '@server/lib/api';
import { getSql } from '@server/lib/db';
import { allocateNextInvoiceNumber } from '@server/services/invoices';

export async function GET() {
  try {
    const userId = await requireUserId();
    const number = await allocateNextInvoiceNumber(getSql(), userId);
    return NextResponse.json({ number });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
