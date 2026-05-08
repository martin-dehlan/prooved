// Profile sanity & consistency checks. Pure functions.
// Used by PublicProfile to surface yellow/red warnings to buyers.

import type { Connection } from '@/features/connections/types/connection.types';

const KYC_PLATFORMS = ['paypal', 'linkedin', 'github'] as const;

function normalizeName(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;]/g, '');
}

/** Check whether two names "look like" the same person — substring or
 * shared first+last token. Tolerant of middle initials. */
function namesMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  // Compare tokens — at least first AND last token must match
  const ta = na.split(' ');
  const tb = nb.split(' ');
  if (ta.length >= 2 && tb.length >= 2) {
    return ta[0] === tb[0] && ta[ta.length - 1] === tb[tb.length - 1];
  }
  return false;
}

export interface NameCheckResult {
  /** All KYC names found (PayPal, LinkedIn, GitHub real-name). */
  names: { source: string; name: string }[];
  /** True if 2+ KYC names exist AND don't all match each other. */
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
  // Compare all pairs — any pair must match
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

/** Suspect when high rating_count + member_since within current year =
 * likely sandbox/fake/pre-aged account. */
export function isSuspectMembership(
  c: Connection,
  now: Date = new Date(),
): { flagged: boolean; reason?: string } {
  if (!c.member_since || c.rating_count == null) return { flagged: false };
  const memberDate = new Date(c.member_since);
  if (Number.isNaN(memberDate.getTime())) return { flagged: false };
  const sameYear = memberDate.getFullYear() === now.getFullYear();
  const futureYear = memberDate.getFullYear() > now.getFullYear();
  if (futureYear) {
    return { flagged: true, reason: 'Mitgliedschaft datiert in der Zukunft' };
  }
  if (sameYear && c.rating_count >= 50) {
    return {
      flagged: true,
      reason: `Hohe Bewertungs-Zahl trotz Account-Alter <1 Jahr`,
    };
  }
  return { flagged: false };
}

/** Format last_fetched as human-readable relative time. */
export function formatActivity(lastFetched: string | null): string | null {
  if (!lastFetched) return null;
  const t = new Date(lastFetched).getTime();
  if (Number.isNaN(t)) return null;
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return 'gerade aktualisiert';
  if (diff < 3600) return `aktualisiert vor ${Math.floor(diff / 60)} Min`;
  if (diff < 86400) return `aktualisiert vor ${Math.floor(diff / 3600)} h`;
  if (diff < 7 * 86400) return `aktualisiert vor ${Math.floor(diff / 86400)} Tagen`;
  if (diff < 30 * 86400) {
    return `aktualisiert vor ${Math.floor(diff / (7 * 86400))} Wochen`;
  }
  return `aktualisiert vor ${Math.floor(diff / (30 * 86400))} Monaten`;
}

/** German month-year from ISO date. */
export function formatMonthYear(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}
