import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ApiError } from './errors';

export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new ApiError('Unauthorized', 401);
  }
  return userId;
}

export function apiErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}
