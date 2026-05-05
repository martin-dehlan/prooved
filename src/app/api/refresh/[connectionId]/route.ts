import { NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/api/requireUser';
import { refreshConnectionData } from '@/features/verify';

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ connectionId: string }> },
) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const { connectionId } = await ctx.params;
  const result = await refreshConnectionData({ userId: auth.userId, connectionId });
  return NextResponse.json(result);
}
