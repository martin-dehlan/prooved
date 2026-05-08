import { NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/api/requireUser';
import { generateBioCode } from '@/shared/lib/utils/bio-code';

// GET /api/connections/website-code
// Returns deterministic verify token for current user — no DB write.
export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  return NextResponse.json({ code: generateBioCode(auth.userId, 'website') });
}
