import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/shared/lib/api/requireUser';
import { verifyAndPersistWallet } from '@/features/wallet';

const bodySchema = z.object({
  address: z.string().min(32).max(64),
  signature: z.string().min(32),
  nonce: z.string().min(8),
});

export async function POST(req: Request) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await verifyAndPersistWallet({
    userId: auth.userId,
    ...parsed.data,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
