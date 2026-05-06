// Dev-only auto-login. Server generates magic link, verifies it server-side,
// and sets session cookies on the response. Bypasses email + TTL.
// REMOVE OR GATE before opening signups to public.

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/shared/types/database.types';

const ALLOWED_EMAILS = new Set([
  'martindehlan@gmail.com',
]);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const email = searchParams.get('email') ?? 'martindehlan@gmail.com';
  const next = searchParams.get('next') ?? '/dashboard';

  if (!ALLOWED_EMAILS.has(email)) {
    return new NextResponse('forbidden', { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // 1. Generate admin magic link (returns hashed_token + email_otp)
  const linkRes = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'magiclink',
      email,
      redirect_to: `${origin}/`,
    }),
  });
  if (!linkRes.ok) {
    return new NextResponse(`generate_link failed: ${linkRes.status}`, { status: 500 });
  }
  const linkData = (await linkRes.json()) as { action_link: string };

  // 2. Hit verify endpoint, capture redirect with #access_token in fragment
  const verifyRes = await fetch(linkData.action_link, { redirect: 'manual' });
  const location = verifyRes.headers.get('location');
  if (!location || !location.includes('#')) {
    return new NextResponse(`verify did not return tokens (status ${verifyRes.status})`, { status: 500 });
  }
  const fragment = location.split('#')[1]!;
  const params = new URLSearchParams(fragment);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) {
    return new NextResponse(`tokens missing in verify response: ${fragment}`, { status: 500 });
  }

  // 3. Set session cookies on outgoing redirect
  const response = NextResponse.redirect(`${origin}${next}`);
  const supabase = createServerClient<Database>(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) {
    return new NextResponse(`setSession failed: ${error.message}`, { status: 500 });
  }

  return response;
}
