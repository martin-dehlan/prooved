import { NextResponse, type NextRequest } from 'next/server';

// Security headers — applied to every response.
// CSP is intentionally not strict-dynamic since we don't have nonces yet;
// next phase: add per-request nonce + remove unsafe-inline for scripts.
const SECURITY_HEADERS: [string, string][] = [
  ['X-Frame-Options', 'DENY'],
  ['X-Content-Type-Options', 'nosniff'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()'],
  ['Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload'],
  [
    'Content-Security-Policy',
    [
      "default-src 'self'",
      // Next + Tailwind inject inline styles + scripts in dev/prod hydration.
      // PostHog loads recorder.js from eu-assets.i.posthog.com (session replay).
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://eu-assets.i.posthog.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // Supabase API + Solana RPC + platform endpoints + PostHog ingestion (eu cloud)
      "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.ebay.com https://api.sandbox.ebay.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://openapi.etsy.com https://api.github.com https://api.linkedin.com https://api.devnet.solana.com https://api.mainnet-beta.solana.com https://eu.i.posthog.com https://eu-assets.i.posthog.com",
      // PostHog session replay uses a Web Worker (blob:)
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  ],
];

export function proxy(_req: NextRequest) {
  const res = NextResponse.next();
  for (const [k, v] of SECURITY_HEADERS) res.headers.set(k, v);
  return res;
}

export const config = {
  // Skip static assets + Next internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
