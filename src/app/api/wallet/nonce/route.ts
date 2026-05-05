import { NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/api/requireUser';
import { issueNonce } from '@/features/wallet';
import { rateLimit, RATE_LIMITS } from '@/shared/lib/rate-limit';

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const rl = rateLimit(auth.userId, RATE_LIMITS.walletVerify);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const nonce = issueNonce(auth.userId);
  return NextResponse.json({ nonce });
}
