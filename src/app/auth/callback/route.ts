import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from '@/i18n/routing';
import type { Database } from '@/shared/types/database.types';

function localeFrom(next: string): string {
  const seg = next.split('/')[1];
  return seg && (routing.locales as readonly string[]).includes(seg)
    ? seg
    : routing.defaultLocale;
}

// PKCE callback: exchanges ?code=... for a session cookie, then redirects to ?next.
// Uses request/response cookie wiring to guarantee Set-Cookie headers reach the browser.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? `/${routing.defaultLocale}/dashboard`;
  const locale = localeFrom(next);

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/register?error=missing_code`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/${locale}/register?error=${encodeURIComponent(error.message)}`,
    );
  }

  return response;
}
