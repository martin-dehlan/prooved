import { NextResponse } from 'next/server';
import { getClientIp } from '@/shared/lib/api/requireUser';
import { submitReport, reportSchema } from '@/features/report';
import { rateLimit, RATE_LIMITS } from '@/shared/lib/rate-limit';

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(ip, RATE_LIMITS.reportSubmit);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await submitReport({ ...parsed.data, reporterIp: ip });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'submit_failed' },
      { status: 500 },
    );
  }
}
