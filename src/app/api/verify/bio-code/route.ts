import { NextResponse } from 'next/server';
import { requireUser, getClientIp } from '@/shared/lib/api/requireUser';
import { verifyBioCodeForConnection } from '@/features/verify';
import { verifyBioCodeSchema } from '@/features/connections';
import { rateLimit, RATE_LIMITS } from '@/shared/lib/rate-limit';

export async function POST(req: Request) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const rl = rateLimit(auth.userId, RATE_LIMITS.bioCodeCheck);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', resetAt: rl.resetAt },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  const body = await req.json();
  const parsed = verifyBioCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await verifyBioCodeForConnection({
    userId: auth.userId,
    connectionId: parsed.data.connectionId,
  });
  return NextResponse.json(result);
}
