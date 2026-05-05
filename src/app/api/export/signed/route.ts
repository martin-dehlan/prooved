import { NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/api/requireUser';
import { buildSignedExport } from '@/features/export';
import { rateLimit, RATE_LIMITS } from '@/shared/lib/rate-limit';

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const rl = rateLimit(auth.userId, RATE_LIMITS.exportRequest);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  try {
    const signed = await buildSignedExport(auth.userId);
    return new NextResponse(JSON.stringify(signed, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="prooved-export.json"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'export_failed' },
      { status: 500 },
    );
  }
}
