import { z } from 'zod';

export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;

// Error messages here are translation keys (namespace `SlugSchema`).
// Resolve via useTranslations('SlugSchema') in the consuming form.
export const slugSchema = z
  .string()
  .min(3, 'minError')
  .max(32, 'maxError')
  .regex(SLUG_REGEX, 'regexError')
  .refine((s) => !RESERVED_SLUGS.has(s), 'reservedError');

export const RESERVED_SLUGS = new Set([
  'admin', 'api', 'app', 'auth', 'dashboard', 'login', 'logout', 'register',
  'signup', 'signin', 'profile', 'profiles', 'connect', 'verify', 'report',
  'reports', 'privacy', 'terms', 'about', 'help', 'support', 'contact',
  'settings', 'me', 'user', 'users', 'public', 'static', '_next', 'favicon',
  'robots', 'sitemap', 'prooved', 'wallet', 'export', 'embed', 'oauth',
  'de', 'en',
]);

export function suggestSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}
