// Profile sanity & consistency checks. Pure functions.
// Used by PublicProfile to surface yellow/red warnings to buyers.

import type { Connection } from '@/features/connections/types/connection.types';

export type Locale = 'de' | 'en';

const KYC_PLATFORMS = ['paypal', 'linkedin', 'github'] as const;

function normalizeName(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;]/g, '');
}

function namesMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const ta = na.split(' ');
  const tb = nb.split(' ');
  if (ta.length >= 2 && tb.length >= 2) {
    return ta[0] === tb[0] && ta[ta.length - 1] === tb[tb.length - 1];
  }
  return false;
}

export interface NameCheckResult {
  names: { source: string; name: string }[];
  hasMismatch: boolean;
}

export function checkNameConsistency(connections: Connection[]): NameCheckResult {
  const names: { source: string; name: string }[] = [];
  for (const c of connections) {
    if (c.hidden) continue;
    if (!c.show_name) continue;
    if (!KYC_PLATFORMS.includes(c.platform as (typeof KYC_PLATFORMS)[number])) continue;
    if (c.verified_name) {
      names.push({ source: c.platform, name: c.verified_name });
    }
  }
  if (names.length < 2) return { names, hasMismatch: false };
  let mismatch = false;
  for (let i = 0; i < names.length - 1; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (!namesMatch(names[i]!.name, names[j]!.name)) {
        mismatch = true;
      }
    }
  }
  return { names, hasMismatch: mismatch };
}

export function isSuspectMembership(
  c: Connection,
  now: Date = new Date(),
): { flagged: boolean } {
  if (!c.member_since || c.rating_count == null) return { flagged: false };
  const memberDate = new Date(c.member_since);
  if (Number.isNaN(memberDate.getTime())) return { flagged: false };
  const sameYear = memberDate.getFullYear() === now.getFullYear();
  const futureYear = memberDate.getFullYear() > now.getFullYear();
  if (futureYear) return { flagged: true };
  if (sameYear && c.rating_count >= 50) return { flagged: true };
  return { flagged: false };
}

/** Format last_fetched as human-readable relative time. */
export function formatActivity(lastFetched: string | null, locale: Locale = 'de'): string | null {
  if (!lastFetched) return null;
  const t = new Date(lastFetched).getTime();
  if (Number.isNaN(t)) return null;
  const diff = (Date.now() - t) / 1000;
  const en = locale === 'en';
  if (diff < 60) return en ? 'just refreshed' : 'gerade aktualisiert';
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return en ? `refreshed ${m} min ago` : `aktualisiert vor ${m} Min`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return en ? `refreshed ${h} h ago` : `aktualisiert vor ${h} h`;
  }
  if (diff < 7 * 86400) {
    const d = Math.floor(diff / 86400);
    return en ? `refreshed ${d} days ago` : `aktualisiert vor ${d} Tagen`;
  }
  if (diff < 30 * 86400) {
    const w = Math.floor(diff / (7 * 86400));
    return en ? `refreshed ${w} weeks ago` : `aktualisiert vor ${w} Wochen`;
  }
  const mo = Math.floor(diff / (30 * 86400));
  return en ? `refreshed ${mo} months ago` : `aktualisiert vor ${mo} Monaten`;
}

/** Localized month-year from ISO date. */
export function formatMonthYear(iso: string | null, locale: Locale = 'de'): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', {
    month: 'long',
    year: 'numeric',
  });
}
