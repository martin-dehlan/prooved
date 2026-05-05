import { z } from 'zod';

export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;

export const slugSchema = z
  .string()
  .min(3, 'Mindestens 3 Zeichen')
  .max(32, 'Maximal 32 Zeichen')
  .regex(SLUG_REGEX, 'Nur a-z, 0-9 und Bindestrich. Kein Bindestrich am Anfang/Ende.')
  .refine((s) => !RESERVED_SLUGS.has(s), 'Dieser Name ist reserviert');

export const RESERVED_SLUGS = new Set([
  'admin', 'api', 'app', 'auth', 'dashboard', 'login', 'logout', 'register',
  'signup', 'signin', 'profile', 'profiles', 'connect', 'verify', 'report',
  'reports', 'privacy', 'terms', 'about', 'help', 'support', 'contact',
  'settings', 'me', 'user', 'users', 'public', 'static', '_next', 'favicon',
  'robots', 'sitemap', 'prooved', 'wallet', 'export', 'embed', 'oauth',
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
