import { supabase } from '@/shared/lib/supabase/client';
import { routing } from '@/i18n/routing';
import type { AppUser } from '@/features/auth/types/auth.types';

function withLocale(path: string, locale: string): string {
  const safe = path.startsWith('/') ? path : `/${path}`;
  const firstSeg = safe.split('/')[1];
  if (firstSeg && (routing.locales as readonly string[]).includes(firstSeg)) return safe;
  return `/${locale}${safe}`;
}

export async function sendMagicLink(email: string, redirectTo?: string, locale?: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const loc = locale && (routing.locales as readonly string[]).includes(locale)
    ? locale
    : routing.defaultLocale;
  const next = withLocale(redirectTo ?? '/dashboard', loc);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getAppUser(authUserId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUserId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('users')
    .select('slug', { count: 'exact', head: true })
    .eq('slug', slug);
  if (error) throw error;
  return (count ?? 0) === 0;
}

export async function createUserProfile(input: {
  authUserId: string;
  email: string;
  slug: string;
  name?: string;
}): Promise<AppUser> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: input.authUserId,
      email: input.email,
      slug: input.slug,
      name: input.name ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
